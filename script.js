//Problema com o bairro de Nossa senhora de Lourdes: o site do openstreemap não referenciava
//corretamente o limite do bairro, portanto novas coordenadas foram inseridas para corrigir o problema
let map;
let finalData=[];
let points=[];
let quantPontos;
let maxDistGatewayToPoint;
let nGateways;
let quantGateways = 0;
let coordGateways = [];
let coordClients = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: { lat: -21.7642, lng: -43.3496 }
  });
}

function main() {
  initMap();
  google.maps.event.trigger(map, 'resize');
  quantPontos = document.getElementById("qtnPts").value;
  maxDistGatewayToPoint = document.getElementById("dist").value;
  nGateways = Math.round((quantPontos * 20) / 100)
  finalData=[];
  points=[];
  quantGateways = 0;
  coordGateways = [];
  coordClients = [];
  
  
  $.getJSON("JSONBounds.txt", function(data) {
    finalData = data;
    finalData[69].coordenadas = bugfix(); //Problema com o bairro de Nossa Senhora de lourdes
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
    var zona, bairros, point;
    for (let index = 0; index < 1000; index++) {
      zona = randomZone(sumZones);

      bairros = bairrosZona(zona);

      point = gerarPonto(bairros);
      if(quantGateways==nGateways){
        while(!verificaPonto(point)){
       
          zona = randomZone(sumZones);

          bairros = bairrosZona(zona);

          point = gerarPonto(bairros);
        }
      }
      desenhaPonto(point);
      
    }

    criarArquivoInstancia();
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
    if (keys.includes(item.zona)) 
      zones[item.zona] += parseInt(item.populacao);
    else 
      zones[item.zona] = parseInt(item.populacao);

    zones["total"] += parseInt(item.populacao);
  });

  return zones;
}

//Retorna uma zona aleatoria de acordo a densidade demográfica do local,
//ou seja, uma zona com uma densidade maior será sorteada mais vezes
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
function bairrosZona(zona) {
  let vetBairros = [];
  for (let index = 0; index < finalData.length; index++) {
    if (finalData[index].zona == zona) vetBairros.push(finalData[index]);
  }
  return vetBairros;
}

//Define um ponto em um bairro escolhido randomicamente
function gerarPonto(bairros) {
  
  //Total de todas as zonas
  let totalpop = 0;
  for (let index = 0; index < bairros.length; index++)
    totalpop += bairros[index].populacao;
  //----

  //Verificando em qual bairro o numero gerado randomicamente está alocado
  let nRandom = Math.floor(Math.random() * (totalpop - 1 + 1)) + 1;
  let min = 0;
  let max = bairros[0].populacao;
  let i;
  for (i = 0; i < bairros.length; i++) {
    if (nRandom >= min && nRandom <= max) break;
    min = max + 1;
    max += bairros[i + 1].populacao;
  }
  //----

  var polygon = new google.maps.Polygon({
    path: bairros[i].coordenadas
  });


  var point = randomizarLatLong(polygon, minMaxLatLong(bairros[i].coordenadas));

  return point;
}

//retorna o maior numero e menor valor de latitude e longitude
function minMaxLatLong(bounds) {
  var minMax = {
    min: { lat: 0, lng: 0 },
    max: { lat: -100, lng: -100 }
  };

  for (var i = 0; i < bounds.length; i++) {
    if (minMax.min.lat > bounds[i].lat) minMax.min.lat = bounds[i].lat;
    if (minMax.min.lng > bounds[i].lng) minMax.min.lng = bounds[i].lng;

    if (minMax.max.lat < bounds[i].lat) minMax.max.lat = bounds[i].lat;
    if (minMax.max.lng < bounds[i].lng) minMax.max.lng = bounds[i].lng;
  }

  return minMax;
}
//----

//Randomiza os valores de lat e lgn até que o mesmo esteja dentro do poligono indicado
function randomizarLatLong(polygon, minMax) {
  /*var point;
  var latitude, longitude;

  latitude = Math.random() * (minMax.max.lat - minMax.min.lat) + minMax.min.lat;
  longitude =
    Math.random() * (minMax.max.lng - minMax.min.lng) + minMax.min.lng;
  point = new google.maps.LatLng(latitude, longitude);

  while (!google.maps.geometry.poly.containsLocation(point, polygon)) {
    latitude =
      Math.random() * (minMax.max.lat - minMax.min.lat) + minMax.min.lat;
    longitude =
      Math.random() * (minMax.max.lng - minMax.min.lng) + minMax.min.lng;
    point = new google.maps.LatLng(latitude, longitude);
  }*/
  var bounds = new google.maps.LatLngBounds();

  for (var i=0; i < polygon.getPath().getLength(); i++) {
    bounds.extend(polygon.getPath().getAt(i));
  }

  var sw = bounds.getSouthWest();
  var ne = bounds.getNorthEast();

  // Guess 100 random points inside the bounds, 
  // put a marker at the first one contained by the polygon and break out of the loop
  while (true) {
    var ptLat = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
    var ptLng = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
    var point = new google.maps.LatLng(ptLat,ptLng);
    if (google.maps.geometry.poly.containsLocation(point,polygon)) {
      break;
    }
  }

  return point;
}
//----

//Desenha de verde os primeiros 20% pontos e o restante de azul e
//popula os vetores com os pontos criados  
function desenhaPonto(point){
  if (quantGateways != nGateways) {
    quantGateways++;

    var marcador = new google.maps.Circle({
      strokeColor: "#00FF00",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#00FF00",
      fillOpacity: 0.35,
      map: map,
      center: point,
      radius: 20
    });
    coordGateways.push(point);
  } else {
    var marcador = new google.maps.Circle({
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#0000FF",
      fillOpacity: 0.35,
      map: map,
      center: point,
      radius: 20
    });
    coordClients.push(point);
  }

  marcador.setMap(map);
}

//verifica se o ponto esta no alcance de pelo menos um gateway
function verificaPonto(point){
  var distancia = 0
  for (let index = 0; index < coordGateways.length; index++) {
    distancia = google.maps.geometry.spherical.computeDistanceBetween(
      coordGateways[index],
      point
    );
    if(distancia<=maxDistGatewayToPoint)
      return true;
    
  }
  return false;
    
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

//Correção das coordenadas do bairro de Nossa Senhora de Lourdes
function bugfix() {
  var MultiGeometryCoordinates =
    "-43.3219525657738,-21.7606695321644,0 -43.3219175302344,-21.76086359101,0 -43.3218775730375,-21.7610022659872,0 -43.3218583210616,-21.7611269310902,0 -43.3217776419759,-21.7612455888117,0 -43.32167654968,-21.7613497128421,0 -43.3215575435913,-21.7614401123257,0 -43.3214225063686,-21.7615228326,0 -43.3212755072492,-21.7615852726183,0 -43.3210600407129,-21.7616341453527,0 -43.3208410363436,-21.7617050425665,0 -43.3208081304168,-21.7617050425665,0 -43.3206083444327,-21.7617567518799,0 -43.3203839332684,-21.7618077201399,0 -43.3201764320481,-21.7619083634827,0 -43.3200007392104,-21.7620185474314,0 -43.3198986602195,-21.7621155090542,0 -43.3198168465598,-21.7622279965273,0 -43.3197579499468,-21.7623523640099,0 -43.3197238793462,-21.7624845806081,0 -43.3197073813722,-21.7626446772865,0 -43.3196892749839,-21.7628725730459,0 -43.3196894656401,-21.7630669188156,0 -43.3196990879073,-21.763204002528,0 -43.319716164203,-21.7633404513804,0 -43.3197406503158,-21.7634759119294,0 -43.31977248284,-21.7636100332905,0 -43.3198632602331,-21.7638580303477,0 -43.3200427542822,-21.7639585845063,0 -43.3208025808066,-21.7638564978735,0 -43.321244745709,-21.764002886911,0 -43.3212817610484,-21.7643161305515,0 -43.3213241393293,-21.7646308222575,0 -43.3203567738379,-21.7650325614358,0 -43.3203341449781,-21.7658523536574,0 -43.320441649811,-21.7662601187615,0 -43.32059007381,-21.7667324492698,0 -43.3208820454178,-21.767143481917,0 -43.3210202717691,-21.767339418724,0 -43.3213246067353,-21.7678157766038,0 -43.3213678924422,-21.7681040528836,0 -43.3214819337142,-21.7682630762502,0 -43.3216040996506,-21.7684139506949,0 -43.3217361652056,-21.768560578106,0 -43.3218997945521,-21.7687040650383,0 -43.322100630985,-21.7688137131268,0 -43.3222909708818,-21.7689129769385,0 -43.3226668993895,-21.7691089166678,0 -43.3227072787745,-21.7689878159475,0 -43.3230205597189,-21.7694166519567,0 -43.3231853472283,-21.7693412427222,0 -43.3234184039231,-21.7689982117916,0 -43.3239479806278,-21.768650746832,0 -43.3249894540433,-21.7678277935398,0 -43.3248734396575,-21.7669404278316,0 -43.32520099814,-21.7663281807636,0 -43.325742559562,-21.7659076154165,0 -43.3264734277692,-21.7656137725116,0 -43.3265852518756,-21.7655347049617,0 -43.3264834104181,-21.7653547314351,0 -43.3259528097599,-21.7646290381471,0 -43.3257633449375,-21.7642874365574,0 -43.3256667440161,-21.763944365234,0 -43.3256502302495,-21.7638116973435,0 -43.3255635252511,-21.7635048623868,0 -43.3254803034126,-21.7630089483216,0 -43.3254818949103,-21.7628394468766,0 -43.3254917084651,-21.7625889599266,0 -43.3235098906933,-21.7613975075608,0 -43.3228680247386,-21.76105575791,0 -43.3219525657738,-21.7606695321644,0";

  //Retorna um array de coordenadas no mesmo formato usado pelo google maps

  var data = [];
  var grouped = MultiGeometryCoordinates.split(" ");

  grouped.forEach(function(item, i) {
    let a = item.trim().split(",");

    data.push({
      lat: parseFloat(a[1]),
      lng: parseFloat(a[0])
    });
  });

  return data;
}

function criarArquivoInstancia(){
  var conteudo = quantPontos+" "+maxDistGatewayToPoint+"\n";
  
  for (let i = 0; i < coordGateways.length; i++) 
    conteudo += coordGateways[i].toUrlValue()+"\n";
  
  for (let i = 0; i < coordClients.length; i++) 
    conteudo += coordClients[i].toUrlValue()+"\n";
  
  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:attachment/text," + encodeURI(conteudo);
  hiddenElement.target = "_blank";
  hiddenElement.download = "instancia.txt";
  hiddenElement.click();

}