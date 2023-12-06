
let video, canvas, ctx
//const synth = new Tone.Synth().toDestination();
const controller = {
  moveing: false,
  x: 0,
  y: 0
}
const colSize = 20
let threshold = 5


function drawController () {
  if (!ctx) return
  const { x, y } = controller
  const radius = 50
  ctx.strokeStyle = 'white'
  ctx.fillStyle = 'white'
  ctx.lineWidth = 2
  // circle
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.stroke()
  // vertical line
  ctx.fillRect(x, 0, 2, canvas.height)
  // horizontal line
  ctx.fillRect(0, y, canvas.width, 2)
}


function parseframes() {
  // NOTE: i replaced "colStart" with controller.x
  const dataToPlay = []
  const imgData = ctx.getImageData(controller.x, 0, colSize, canvas.height)
  const data = imgData.data
  let blockHeight = Math.floor(canvas.height / 120)

  for (let i = 0; i < 120; i++) {
    let block = i * colSize * blockHeight * 4;
    let avg = (data[block] + data[block + 1] + data[block + 2]) / 3;
    if (avg < threshold) {
      avg = 0;
      dataToPlay[i] = true;
    } else {
      avg = 255;
      dataToPlay[i] = false;
    }
    for (let j = 0; j < colSize * blockHeight * 4; j += 4) {
      data[block + j] = avg; // Red channel
      data[block + j + 1] = avg; // Green channel
      data[block + j + 2] = avg; // Blue channel
    }
  }
  ctx.putImageData(imgData, controller.x, 0)
  return dataToPlay
}

function playSynth (data) {
  const numToNotes = [ 
    "C" ,"C#" ,"D" ,"D#" ,"E#" ,"F" ,"F#" ,"G" ,"G#" ,"A" ,"A#" ,"B"
  ]
  const melody = []
  const synth = new Tone.Synth().toDestination();
  for (let i = 0; i < data.length; i++) {
    let convert = 120 - i
    const note = numToNotes[convert % 12]
    const oct = Math.floor(convert / 12)
    if (data[i]) melody.push(`${note}${oct}`)
  }
  //console.log(melody)
  /*WRITE TONE.SEQUENCE */
  const duration = 1 / melody.length; // Duration for each note
  const shuffle = melody.sort((a, b) => 0.5 - Math.random());

  const sequence = new Tone.Sequence(
    (time, note) => {
      synth.triggerAttackRelease(note, duration)
      console.log(note, duration, time)
    }, shuffle, duration
  )
  sequence.loop = false
  Tone.Transport.start();
  sequence.start();

  setTimeout(() => {
    sequence.stop();
    Tone.Transport.stop();
  }, 1000);

}


function update() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    // only resize canvas if necessary
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }
    // draw video to canvas
    ctx.drawImage(video, 0, 0)
    // update + draw the bar (returns dataToPlay)
    const dataToPlay = parseframes()      
    // raw the crosshair controller
    drawController()
    // play the synth
    playSynth(dataToPlay)
  }
  // recursively call update
  setTimeout(update, 1000)
}


async function setup() {
  // setup video element
  video = nn.create('video').set({
    autoplay: true,
    muted: true,
    playsinline: true,
    stream: await nn.askFor({
      video: true
    })
  })
  video.addTo('body')

  // setup canvas element && ctx (context)
  canvas = nn.create('canvas')
  ctx = canvas.getContext('2d')
  canvas.on('mousedown', () => {
    controller.moving = true
  })
  canvas.on('mousemove', (e) => {
    if (controller.moving) {
      controller.x = e.x
      controller.y = e.y
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      threshold = nn.map(e.y, 0, canvas.height, 200, 5)
      drawController()
    }
  })
  canvas.on('mouseup', () => {
    controller.moving = false
  })
  canvas.addTo('body')

  // start the loop
  update()
}


nn.on('load', setup)
    

    
    
    
    
    
    
    
  