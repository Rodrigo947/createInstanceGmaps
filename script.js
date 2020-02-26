function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: -21.7642, lng: -43.3496} 
    });
    boundsNeighborhood();
    
}

function boundsNeighborhood(){
  
    $.getJSON('JSONBounds.txt', function(data){
    
        finalData = data;
        finalData.forEach(function(item){
            var polygon = new google.maps.Polygon({
                path: item.coordenadas,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                fillOpacity: 0
            });
            polygon.setMap(map);
        });

    });

}