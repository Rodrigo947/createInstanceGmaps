function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: { lat: -21.7642, lng: -43.3496 }
  });
  boundsNeighborhood();
}

function boundsNeighborhood() {
  $.getJSON("JSONBounds.txt", function(data) {
    finalData = data;
    finalData.forEach(function(item) {
      var polygon = new google.maps.Polygon({
        path: item.coordenadas,
        strokeColor: "#FF0000",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillOpacity: 0
      });
      polygon.setMap(map);
    });

    var sumZones = sumPopZone();
    //console.log(testeDeRandomizacao(sumZones));

    for (let index = 0; index < 1000; index++) {
      var zona = randomZone(sumZones);

      var bairros = allBairros(zona);

      escolheBairro(bairros);
      
    }
    

  });
}

//Retorna um array com a soma da população de todos os bairros por zonas
function sumPopZone() {
  let zones = {
    total: 0
  };
  let keys;
  finalData.forEach(function(item) {
    keys = Object.keys(zones);
    if (keys.includes(item.zona)) zones[item.zona] += parseInt(item.populacao);
    else zones[item.zona] = parseInt(item.populacao);

    zones["total"] += parseInt(item.populacao);
  });

  return zones;
}

//Retorna uma zona aleatoria de acordo a desidade demográfica do local,
//ou seja, uma zona com uma desidade maior será sorteada mais vezes
function randomZone(sumZones) {
  let nRandom = Math.floor(Math.random() * (sumZones["total"] - 1 + 1)) + 1;
  let keys = Object.keys(sumZones);
  let values = Object.values(sumZones);

  let min = 0;
  let max = values[1];

  for (let index = 1; index < keys.length; index++) {
    if (nRandom >= min && nRandom <= max) return keys[index];
    min = max + 1;
    max += values[index + 1];
  }
}

//Retorna um array com todos os bairros da zona informada
function allBairros(zona) {
  let vetBairros = [];
  for (let index = 0; index < finalData.length; index++) {
    if(finalData[index].zona == zona)
      vetBairros.push(finalData[index]);
  }
  return vetBairros;
}

//Define um ponto em um bairro escolhido randomicamente
function escolheBairro(bairros){
 
  let totalpop = 0;
  for (let index = 0; index < bairros.length; index++)
    totalpop += bairros[index].populacao;

  let nRandom = Math.floor(Math.random() * (totalpop - 1 + 1)) + 1;

  
  let min = 0;
  let max = bairros[0].populacao;
  let i;
  for (i = 0; i < bairros.length; i++) {
    if (nRandom >= min && nRandom <= max) break;
    min = max + 1;
    max += bairros[i + 1].populacao;
  }


  var polygon = new google.maps.Polygon({
    path: bairros[i].coordenadas
  });

  var marcador = new google.maps.Circle({
    strokeColor: '#0000FF',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#0000FF',
    fillOpacity: 0.35,
    map: map,
    center: randomizarLatLong(polygon, minMaxLatLong(bairros[i].coordenadas)),
    radius: 20
    });

  marcador.setMap(map);

 

}

//retorna o maior numero e menor valor de latitude e longitude
function minMaxLatLong(bounds){
  var minMax = {
      min: {lat: 0, lng: 0},
      max: {lat: -100, lng: -100}
  }
      
  for(var i=0;i<bounds.length;i++){
      
      if(minMax.min.lat>bounds[i].lat) minMax.min.lat = bounds[i].lat;
      if(minMax.min.lng>bounds[i].lng) minMax.min.lng = bounds[i].lng;

      if(minMax.max.lat<bounds[i].lat) minMax.max.lat = bounds[i].lat;
      if(minMax.max.lng<bounds[i].lng) minMax.max.lng = bounds[i].lng;
  }

  return minMax;
}

//Randomiza os valores de lat e lgn até q o mesmo esteja dentro do poligono indicado
function randomizarLatLong(polygon,minMax){
  var point;
  var latitude,longitude;
 
  latitude = Math.random() * (minMax.max.lat - minMax.min.lat) + minMax.min.lat;
  longitude = Math.random() *  (minMax.max.lng - minMax.min.lng) + minMax.min.lng;
  var point =  new google.maps.LatLng(latitude, longitude);
  
  while(!google.maps.geometry.poly.containsLocation(point,polygon)){
      latitude = Math.random() * (minMax.max.lat - minMax.min.lat) + minMax.min.lat;
      longitude = Math.random() *  (minMax.max.lng - minMax.min.lng) + minMax.min.lng;
      point = new google.maps.LatLng(latitude, longitude);
  }

  return point;
}



//Mostra a pocentagem de valores de cada zona
//Função apenas para verificar se a randomização de zonas corresponde com a porcentagem real
function testeDeRandomizacao(sumZones) {
  let zona, keys;
  let porcentagem = {};
  for (let index = 0; index < 10000; index++) {
    keys = Object.keys(porcentagem);
    zona = randomZone(sumZones);

    if (keys.includes(zona)) porcentagem[zona]++;
    else porcentagem[zona] = 1;
  }

  for (var key in porcentagem) {
    console.log(key + ":" + (porcentagem[key] * 100) / 10000);
  }
  //-----------------------------------
}
