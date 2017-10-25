var googleTTS = require('google-tts-api');
var fs = require('fs');
var https = require('https');
var audioconcat = require('audioconcat')
var exec = require('child_process').exec;

var texto = 'A decisão da Prefeitura em relação a esse tema é aguardar. Nós não queremos transformar isso em uma polêmica interminável. Há sempre um cuidado muito grande da Prefeitura, seja na área da educação, seja na área de assistência social. Nós estamos avaliando com cuidado, mas não haverá nenhuma decisão para que a farinata seja distribuída neste momento”, disse o tucano. O prefeito usou a palavra “recuo” para definir a opção da Prefeitura. “Nós recuamos taticamente e também explicitamente para termos total segurança em relação a esse projeto. Então, no momento, ela não será mais distribuída na merenda escolar”, reforçou. De acordo com a Prefeitura, os alimentos in natura continuarão sendo distribuídos nos centros de acolhida da rede municipal. O granulado, batizado de “alimento”, seria, então, utilizado apenas nos casos mais críticos, em quadros de desnutrição, como uma espécie de suplemento alimentar. Para isso, o próximo passo da gestão Doria, que ainda não tem prazo para ocorrer, será mapear a população da capital em situação mais vulnerável. O tucano ressaltou, no entanto, que tem confiança no granulado, até porque foi indicado, segundo ele, pela Cúria Metropolitana. “O produto é bom. Quero mencionar que qualitativamente o produto é bom”, disse. “Vamos agir com mais cautela do que já normalmente teríamos”, completou.'


var tdp = texto.split('.\ ')
var temp = [];

for (var i in tdp){
  if(tdp[i].length >= 200){
    for(var e in tdp[i].split(',\ ')){
      temp.push(tdp[i].split(',\ ')[e])
    }
  } else {
    temp.push(tdp[i])
  }
}


var chunks = texto.match(/.{1,200}/g)

var time = Date.now();
var path = `./outputs/${time}`


fs.mkdirSync(path);

//exec(`cp ./inputs/blank.mp3 ${path}/all.mp3`, function (error, stdout, stderr) {});


const downloadMP3 = (text, lang, path, id) => {
  return new Promise( function(complete, reject){
    googleTTS(text, lang)
    .then(url =>   {
      var file = fs.createWriteStream(`${path}/${id}.mp3`);
      var request = https.get(url, function(response) {
        response.pipe(file);
        complete(`id: ${id} downloading...`)
      });
    })
    .catch(function (err) {
      console.error(err.stack);
      reject(err.stack)
    });

  })
}


//Download all files
let promises = []

for(var i in temp)
  promises.push(
    downloadMP3(temp[i], 'pt-br', path, i))

Promise
  .all(promises)
  .then(log => {
    fs.readdir(path, (err, files) => {


      console.log('--------------------------------------------------------')
      var paths = files.reduce((p, f) => `${p}${path}/${f}|`, '').slice(0, -1)
      
        exec(`ffmpeg -i "concat:${paths}" -acodec copy ${path}/output.mp3 && ffmpeg -i ${path}/output.mp3 -i ./inputs/backtrack_1.mp3 -filter_complex amerge -ac 2 -c:a libmp3lame -q:a 4 ${path}/podcast.mp3`, function(){
        
        console.log('--------------------------------------------------------')
        
      });
      
    })

  })