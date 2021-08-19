let host = location.hostname;
let ws = new WebSocket("ws://" + host + ":13253");

//上から
//const modelURL = 'https://teachablemachine.withgoogle.com/models/Usf7XNeR9/';
//横から
//const modelURL = 'https://teachablemachine.withgoogle.com/models/t415P0wFc/';
//for particle
//const modelURL = 'https://teachablemachine.withgoogle.com/models/CCSpDsliu/';
//for particle_ver2
const modelURL = 'https://teachablemachine.withgoogle.com/models/3IM7iUU5e/';
const checkpointURL = modelURL + "model.json";
const metadataURL = modelURL + "metadata.json";


let webcam;
let w = 640,
  h = 480;

let model;
let totalClasses;
// let socket;

async function load() {
  model = await tmImage.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();
  console.log("Number of classes, ", totalClasses);
}

async function loadWebcam() {
  webcam = new tmImage.Webcam(w, h); // can change width and height
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loopWebcam);
}

async function loopWebcam(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loopWebcam);
}


async function setup() {
  myCanvas = createCanvas(w, h);
  ctx = myCanvas.elt.getContext("2d");

  ws.onmessage = function (event) {
    //console.log(event.data);
  }

  // Call the load function, wait until it finishes loading
  await load();
  await loadWebcam();
}

async function predict() {
  // in this case we set the flip variable to true since webcam 
  // was only flipped in CSS 
  const prediction = await model.predict(webcam.canvas, true, totalClasses);

  // Sort prediction array by probability
  // So the first classname will have the highest probability
  const sortedPrediction = prediction.sort((a, b) => - a.probability + b.probability);
  let message = sortedPrediction[0].className;

  //console.log(sortedPrediction[0].className + "," + sortedPrediction[0].probability.toFixed(2));
  const judge = select('#judgeResult'); // select <span id="res">
  judge.html(message);
  ws.send(message);

  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
  }
}
