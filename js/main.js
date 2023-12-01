let video, image, canvas; 

const numToNotes = new Map([
  [0, "C"],
  [1, "C#"],
  [2, "D"],
  [3, "D#"],
  [4, "E#"],
  [5, "F"],
  [6, "F#"],
  [7, "G"],
  [8, "G#"],
  [9, "A"],
  [10, "A#"],
  [11, "B"],
]);

const synth = new Tone.PolySynth(Tone.Monosynth).toDestination();
var colStart = 0;
var threshold = 5;

async function update(){
  parseframes();
}

async function setup() {

  video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true});
    video.srcObject = stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
  document.body.appendChild(video);
  canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

 // var outputContainer = document.createElement("div");
 // document.body.appendChild(outputContainer);
//outputContainer.appendChild(canvas);

  var slider = document.createElement('input');

  slider.type = 'range';
  slider.id = 'slider';
  slider.min = 0;
  slider.max = 640;
  slider.value = 0;
  slider.step = 1;

  document.body.appendChild(slider);
  var slidertxt = document.createElement('p');
  slidertxt.className = 'txt';
  const snode = document.createTextNode("SLIDER");
  slidertxt.appendChild(snode);
  document.body.appendChild(slidertxt);
  
  var threshold = document.createElement('input');

  threshold.type = 'range';
  threshold.id = 'threshold';
  threshold.min = 0;
  threshold.max = 100;
  threshold.value = 5;
  threshold.step = 1;
  document.body.appendChild(threshold);

  var thresholdtxt = document.createElement('p');
  thresholdtxt.className = 'txt';
  const tnode = document.createTextNode("THRESHOLD");
  thresholdtxt.appendChild(tnode);
  document.body.appendChild(thresholdtxt);

  
  video.addEventListener('loadedmetadata', () => {
    setTimeout(parseframes, 1000);
    //parseframes();
  });

}
window.addEventListener('load', setup);

function updateColStart (e){
  var sval = document.getElementById("slider").value;
  colStart = sval;
}

function updateThreshold (e){
  var tval = document.getElementById("threshold").value;
  threshold = tval;
}


async function parseframes (){

  const ctx = canvas.getContext('2d')

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    // Set the canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    let colSize = 20; // width of column 
    const dataToPlay = [];
    let dataToPlayIndex = 0;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    

   // imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //const data = imgData.data;

    //let pixelStart = 200;
    // Get pixel data for the specified column
    updateColStart();
    console.log(colStart);
    const imgData = ctx.getImageData(colStart, 0, colSize, canvas.height);//200 should be colNum
    const data = imgData.data;
    let blockHeight = Math.floor(canvasHeight/120);
    for (let i = 0; i < 120; i++){
      let block = i * colSize * blockHeight * 4;
      let avg = (data[block] + data[block + 1] + data[block + 2]) / 3;
      updateThreshold();
      if (avg < threshold){
        avg = 0;
        dataToPlay[i] = true;
       // console.log('true');
      } else {
        avg = 255;
        dataToPlay[i] = false;
      }
      for (let j = 0; j < colSize * blockHeight * 4; j +=4){
        data[block + j] = avg; // Red channel
        data[block + j + 1] = avg; // Green channel
        data[block + j + 2] = avg; // Blue channel
      }
    }

    ctx.putImageData(imgData, colStart, 0);
    playSynth(dataToPlay);
   // console.log('Synth triggered!');
  }
  setTimeout(update, 1000);
}

function playSynth(data) {
  const chord = [];
  for (let i = 0; i < data.length; i++){
    let convert = 120 - i;
    if (data[i]){
      chord.push(`${numToNotes.get(convert % 12 )}${ Math.floor(convert / 12)}`);
      //console.log("adding note");
     // console.log(`${numToNotes.get(convert % 12 )}${ Math.floor(convert / 12)}`);
      //console.log(`${numToNotes.get( i )}${i % 11}`);
    }
  }
  if (chord.length > 0) {
    synth.triggerAttackRelease(chord, 1);
  }
}

    
    
    
    
    
    
    
  