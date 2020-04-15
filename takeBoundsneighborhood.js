//SCRIPTS NECESSARIOS PARA GERAR A BASE DE DADOS DE JUIZ DE FORA
//1.O arquivo de bairrosJF.csv contém informações da quantidade de população e qual zona de cada bairro 
//2.A partir desse arquivo é gerado a estrutura do array de objetos
//3.Ainda faltava as coordenadas dos limites de cada bairro, portanto foi usado dados do openstreemap
//4."https://nominatim.openstreetmap.org/search.php?q=" +nomeBairro +"+juiz+de+fora&polygon_geojson=1&format=json" por meio desse link foi
//possível receber um Json com os limites de cada bairro e assim gerar o poligono correspondente no mapa
//5.Finalmente, um novo arquivo foi gerado, JSONBounds.txt, com todas as informções necessárias de cada bairro. Inclui:
//  a) Nome do Bairro
//  b) População
//  c) Zona
//  d) Cordenadas dos limites do bairro

$(function() {
  $.ajax({
    type: "GET",
    url: "bairrosJF.csv",
    dataType: "text",
    success: function(response) {
      //Ler dados do arquivo csv e transformar em um array de objetos
      var semQuebrasDeLinha = response.split("\n");
      semQuebrasDeLinha.forEach(function(item, i) {
        let a = item.trim().split(";");
        if (a[0] != "")
          finalData.push({
            bairro: a[0],
            populacao: parseFloat(a[1]),
            zona: a[2],
            coordenadas: []
          });
      });
      //-------------------

      //Popula os limites de latitude e longitude de cada bairro
      finalData.forEach(function(item) {
        var nomeBairro = item.bairro.replace(/ /g, "+");
        $.getJSON(
          "https://nominatim.openstreetmap.org/search.php?q=" +
            nomeBairro +
            "+juiz+de+fora&polygon_geojson=1&format=json",
          function(data) {
            data[0].geojson.coordinates[0].forEach(function(latlng, i) {
              item.coordenadas.push({
                lat: parseFloat(latlng[1]),
                lng: parseFloat(latlng[0])
              });
            });
          }
        );
      });
      //-------------------

      //Transforma todos os dados em um arquivo de texto em formato JSON
      var myJSON = JSON.stringify(finalData);
      var hiddenElement = document.createElement("a");
      hiddenElement.href = "data:attachment/text," + encodeURI(myJSON);
      hiddenElement.target = "_blank";
      hiddenElement.download = "myFile.txt";
      hiddenElement.click();
      //-------------------
    }
  });
});
