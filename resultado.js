$(() => {
  $("#fileinput").on("change", () => {
    mostrarResultado();
  });

  function mostrarResultado() {
    initMap()
    var input = document.getElementById("fileinput");
    var file = input.files[0];
    var fr = new FileReader();
    fr.readAsText(file);
    fr.onload = function (e) {
        var gateways = JSON.parse(e.target.result);
        gatewaysSemClientes = 0 
        firstPosition = true
        gateways.forEach((gateway,index) => {
          //Configurações gerais do resultado
          if(index ==0){
            $("#SNRMinimo").html(gateway.SNRminimo)
            $("#do").html(gateway.dispOuvidos)
            $("#di").html(gateway.dispInoperantes)
            $("#raio").html(gateway.raio)
          }
          //Impressão de gateway e seus clientes
          else{
            color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
            PointGateway = new google.maps.LatLng(gateway.lat,gateway.lng)
            maiorDist = 0
            if(gateway.clients != null){
              gateway.clients.forEach(client => {
                var configClient = {
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillOpacity: 0.35,
                  map: map,
                  center: { lat: client.lat, lng: client.lng },
                  radius: 20,
                  fillColor: color,
                  strokeColor: color
                };
                var marcadorClient = new google.maps.Circle(configClient);
                marcadorClient.setMap(map);
  
                PointClient = new google.maps.LatLng(client.lat, client.lng);
                
                distancia = google.maps.geometry.spherical.computeDistanceBetween(
                    PointGateway,
                    PointClient
                );
                if(distancia > maiorDist) maiorDist = distancia;
              });
            }
            else
              gatewaysSemClientes++

            var configGateway = {
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillOpacity: 0.35,
              map: map,
              center: { lat: gateway.lat, lng: gateway.lng },
              radius: ( (maiorDist) < 20) ? 20 : maiorDist,
              fillColor: color,
              strokeColor: color
            };
            var marcadorGateway = new google.maps.Circle(configGateway);
            marcadorGateway.setMap(map);
          }
            
          
        });
        $("#gsd").html(gatewaysSemClientes)
        
    };
  }
});
