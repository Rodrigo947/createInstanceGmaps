$(function() {
    
    $("#thead").innerHTML=""
    $("#tbody").innerHTML=""
    
    $("#dbiMin").val();
    $("#dbiMax").val();
    
    table = document.getElementById("thead")
    
    //Potencias 
    row = table.insertRow(1)
    cell0 = row.insertCell(0);
    cell0.innerHTML = "#"
    
    cellth1 = row.insertCell(1);
    cellth2 = row.insertCell(2);
    cellth1.innerHTML = $("#dbiMin").val()
    cellth2.innerHTML = $("#dbiMax").val()

    $("#dbiMin").on("change", function(){
        
        if($("#dbiMin").val()<14)
            cellth1.innerHTML = 14
        else
            if($("#dbiMin").val()>20)
                cellth1.innerHTML = 20
            else
                cellth1.innerHTML = $("#dbiMin").val()
        criarMatrizAlcance()
    })

    $("#dbiMax").on("change", function(){
        if($("#dbiMax").val()<14)
            cellth2.innerHTML = 14
        else
            if($("#dbiMax").val()>20)
                cellth2.innerHTML = 20
            else
                cellth2.innerHTML = $("#dbiMax").val()
        criarMatrizAlcance()
    })
    //---------

    //SFs
    

    $("#sfMin,#sfMax").on("change", function(){
        popularlinhas()
    })
    
    popularlinhas()
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
                row = table.insertRow(j)
                cell = row.insertCell(0);
                cell.innerHTML = i
                cell1 = row.insertCell(1);
                cell2 = row.insertCell(2);
                cell1.innerHTML = i*5
                cell2.innerHTML = i*10
                j++
            }
            criarMatrizAlcance()
        }
    }


    criarMatrizAlcance()
    function criarMatrizAlcance(){
        matrizAlcance = {}
        
        var thead = document.getElementById("thead").lastElementChild
        var tbody = document.getElementById("tbody")
        
        for (let i = 1; i < thead.childElementCount; i++) {
            potencia = thead.children[i].innerText    
            matrizAlcance[potencia] = {}
            
            for (let j = 0; j < tbody.childElementCount; j++) {
                row = tbody.children[j]
                sf = row.children[0].innerText
                matrizAlcance[potencia][sf] = row.children[i].innerText
            }
        }


    }

    $("#downloadJson").on("click",function(){
        conteudo = JSON.stringify(matrizAlcance, null, ' ')
        var hiddenElement = document.createElement("a");
        hiddenElement.href = "data:attachment/text," + encodeURI(conteudo);
        hiddenElement.target = "_blank";
        hiddenElement.download = "matrizAlcance.json";
        hiddenElement.click();
    })
});