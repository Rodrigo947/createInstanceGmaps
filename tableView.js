matrizSensibilidade = {
    125:{7:-123,8:-126,9:-129,10:-132,11:-133,12:-136},
    250:{7:-120,8:-123,9:-125,10:-128,11:-130,12:-133},
    500:{7:-116,8:-119,9:-122,10:-125,11:-128,12:-130}
}
matrizSNRMinima = {
    7: -7.5,
    8: -10,
    9: -12.5,
    10: -15,
    11: -17.5,
    12: -20
}

$(function() {
     
    table = document.getElementById("thead")
    
    //Potencias 
    row = table.insertRow(2)
    cellth1 = row.insertCell(0);
    cellth2 = row.insertCell(1);
    cellth1.innerHTML = $("#ptc1").val()
    cellth2.innerHTML = $("#ptc2").val()
    band = 125
    popularlinhas()
    popularTabelaSNR()
    criarMatrizAlcance()


    $("#ptc1").on("change", function(){
        if($("#ptc1").val()<14)
            cellth1.innerHTML = 14
        else
            if($("#ptc1").val()>20)
                cellth1.innerHTML = 20
            else
                cellth1.innerHTML = $("#ptc1").val()
        criarMatrizAlcance()
    })

    $("#ptc2").on("change", function(){
        if($("#ptc2").val()<14)
            cellth2.innerHTML = 14
        else
            if($("#ptc2").val()>20)
                cellth2.innerHTML = 20
            else
                cellth2.innerHTML = $("#ptc2").val()
        criarMatrizAlcance()
    })

    //---------
    
    //SFs
    $("#sfMin,#sfMax").on("change", function(){
        sfMin = parseInt($("#sfMin").val())
        sfMax = parseInt($("#sfMax").val())

        if(sfMin>sfMax)
            $("#btnCriar").prop('disabled', true);
        else
            $("#btnCriar").prop('disabled', false);
        popularlinhas()
        popularTabelaSNR()
    })
   
    $("#downloadJson").on("click",function(){
        conteudo = "{"+"\n"
        for (var [key, value] of Object.entries(matrizAlcance)) {
          conteudo += "\"" + key + "\":{"
          
          for (var [key2, value2] of Object.entries(value)) 
            conteudo += "\"" + key2 + "\":\"" + value2 + "\"," 
          conteudo = conteudo.substr(0, conteudo.length - 1);
          conteudo += "},\n"
        }
        conteudo = conteudo.substr(0, conteudo.length - 2);
        conteudo += "\n}"+"\n"
        var hiddenElement = document.createElement("a");
        hiddenElement.href = "data:attachment/text," + encodeURI(conteudo);
        hiddenElement.target = "_blank";
        hiddenElement.download = "matrizAlcance.json";
        hiddenElement.click();
    })

    $("#dbi").on("change", function(){
        criarMatrizAlcance()
    })
   
});



function decimalAdjust(type, value, exp) {
    // Se exp é indefinido ou zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Se o valor não é um número ou o exp não é inteiro...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Transformando para string
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Transformando de volta
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

function calcAlcanceMaximo(sensibilidade,potencia,ganhodBi){

    calc1 = potencia-sensibilidade-32.44
    calc2 = 20*Math.log10(915)
    calc3 = 2*ganhodBi

    resultado =  Math.pow( 10, ( (calc1 - calc2 + calc3) * 1/20) )
    return decimalAdjust('ceil',resultado,-2)
}


function criarMatrizAlcance(){
    matrizAlcance = {}
        
    sensibilidades = {
        "bw": parseInt($("#bw").val())
    }

    sfMin = parseInt($("#sfMin").val())
    sfMax = parseInt($("#sfMax").val())

    for (let i = sfMin; i <= sfMax; i++) 
        sensibilidades[i] = parseFloat($("#sens"+i).val())
        
    
    ganhodBi = parseFloat($("#dbi").val())
    var thead = document.getElementById("thead").lastElementChild
    var tbody = document.getElementById("tbody")
    
    for (let i = 0; i < thead.childElementCount; i++) {
        potencia = thead.children[i].innerText    
        matrizAlcance[potencia] = {}
        
        for (let j = 0; j < tbody.childElementCount; j++) {
            row = tbody.children[j]
            if(j==0){
                sf = row.children[1].innerText
                sensibilidade = parseFloat($("#sens"+sf).val())
                row.children[3+i].innerText = calcAlcanceMaximo(sensibilidade,potencia,ganhodBi)
                matrizAlcance[potencia][sf] = row.children[3+i].innerText
            }
            else{
                sf = row.children[0].innerText
                sensibilidade = parseFloat($("#sens"+sf).val())
                row.children[2+i].innerText = calcAlcanceMaximo(sensibilidade,potencia,ganhodBi)
                matrizAlcance[potencia][sf] = row.children[2+i].innerText
            }
            
        }
    }

}

function popularlinhas(){
    table = document.getElementById("tbody")
    table.innerHTML=""
    
    sfMin = parseInt($("#sfMin").val())
    sfMax = parseInt($("#sfMax").val())

    if(sfMin<=sfMax){
        
        if($("#sfMin").val()<7)
            sfMin=7
        if($("#sfMax").val()>12)
            sfMax=12


        j = 0
        for (i = sfMin; i <= sfMax; i++) {
            ncolunas = 0
            row = table.insertRow(j)
            if(i==sfMin){
                cell0 = row.insertCell(ncolunas);
                cell0.rowSpan = sfMax-sfMin+1
                cell0.innerHTML = "<select id='bw'><option>125</option><option>250</option><option>500</option>"
                cell0.style.verticalAlign="middle"
                ncolunas++;
            }
            cell1 = row.insertCell(ncolunas++)
            cell2 = row.insertCell(ncolunas++)
            cell3 = row.insertCell(ncolunas++)
            cell4 = row.insertCell(ncolunas++)
            cell1.innerHTML = i
            cell2.innerHTML = "<input type='number' id=sens"+i+" class='form-control' value='"+matrizSensibilidade[band][i]+"' >"
            $("#bw").val(band)
            cell3.innerHTML = calcAlcanceMaximo(matrizSensibilidade[band][i],parseInt($("#ptc1").val()),parseFloat($("#dbi").val()))
            cell4.innerHTML = calcAlcanceMaximo(matrizSensibilidade[band][i],parseInt($("#ptc2").val()),parseFloat($("#dbi").val()))
            j++
        }
        criarMatrizAlcance()
    }

    $("#sens7,#sens8,#sens9,#sens10,#sens11,#sens12").on("change", function(){
        criarMatrizAlcance()
    })

    $("#bw").on("change", function(){
        band =  $("#bw").val()
        sfMin = parseInt($("#sfMin").val())
        sfMax = parseInt($("#sfMax").val())
    
        for (let i = sfMin; i <= sfMax; i++) 
            $("#sens"+i).val(matrizSensibilidade[band][i])
        criarMatrizAlcance()
    })
}

function popularTabelaSNR(){
    tableSNR = document.getElementById("tbodySNR")
    tableSNR.innerHTML=""
    
    rowSF = tableSNR.insertRow(0)
    rowSNR = tableSNR.insertRow(1)
    ncolunas = 0
    cell = rowSF.insertCell(ncolunas);
    cell.innerHTML = "SF"
    cell = rowSNR.insertCell(ncolunas);
    cell.innerHTML = "SNR Mínima (db)"
    
    for (i = sfMin; i <= sfMax; i++) {
        ncolunas++
        cell = rowSF.insertCell(ncolunas)
        cell.innerHTML = i
        cell = rowSNR.insertCell(ncolunas)
        cell.innerHTML = "<input type='number' id=snr"+i+" class='form-control' value='"+matrizSNRMinima[i]+"' >"
        
        $("#snr"+i).on("change", function(){
          matrizSNRMinima[this.id.split("snr")[1]] = parseFloat(this.value)
        })
    }

    $("#tituloSNR").attr('colspan',sfMax-sfMin+2)

    
}

