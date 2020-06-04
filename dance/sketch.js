var SMOTHING = .7
var HEIGHT_OF_TOP_BAR = 30;

var ogVidWidth = 100;
var ogVidHeight = 100;

let video;
let poseNet;
let pose;
let skeleton;
let sineWave;

function setup() {
  console.log(windowWidth);
  var cnv = createCanvas(windowWidth, windowHeight - HEIGHT_OF_TOP_BAR);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

function preload() {
  // preload images;
}



function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

let previouslyAbove = null;
guitar_len = 700;
rwx = 1;
rwy = 1;
lwy = 1;
lwx = 1;

function draw() {
  console.log("hi");
  background(255);
  ogVidWidth = video.width;
  ogVidHeight = video.height;
  var porportionW = windowWidth / ogVidWidth
  var porportionH = (windowHeight - HEIGHT_OF_TOP_BAR) / ogVidHeight
  porportionToUse = Math.min(porportionW, porportionH)

  if (porportionToUse == porportionH) {  
    translate(windowWidth - (windowWidth - ogVidWidth) / 2, 0);
    scale(-1.0, 1.0);
  } else {
    translate(windowWidth, 0);
    scale(-1.0, 1.0);
  }

  scale(porportionToUse);
  image(video, 0, 0);

  strokeWeight(10); // Beastly
  line(ogVidWidth * .1, ogVidHeight * .1, ogVidWidth * .1, ogVidHeight * .9);
  line(ogVidWidth * .1, ogVidHeight * .9, ogVidWidth * .9, ogVidHeight * .9);

  if (pose) {
    lwx_raw = pose.leftWrist.x;
    lwy_raw = pose.leftWrist.y;
    rwx_raw = pose.rightWrist.x;
    rwy_raw = pose.rightWrist.y;
    lwx = (lwx_raw * (1 - SMOTHING)) + (lwx * SMOTHING);
    lwy = (lwy_raw * (1 - SMOTHING)) + (lwy * SMOTHING);
    rwx = (rwx_raw * (1 - SMOTHING)) + (rwx * SMOTHING);
    rwy = (rwy_raw * (1 - SMOTHING)) + (rwy * SMOTHING);


    circle(pose.nose.x, pose.nose.y, 50);
    circle(lwx, lwy, 50);
    circle(rwx, rwy, 50);
    circle(0, 0, 50);
    circle(ogVidWidth, ogVidHeight, 50);


    var rh = Math.abs((rwx) - (ogVidWidth * .1)) / ogVidWidth;
    var RH_MAX = .4
    if(rh > RH_MAX){rh = RH_MAX;}
    rh = (rh/RH_MAX);
    
    var note = ((-rh * 50) + 100); // this is where we will do scales and quantize.

    var freq = noteToFreq(note);
    if(sineWave){
      sineWave.frequency = freq;
    }
    console.log(sineWave);

    var lh = Math.abs((lwy) - (ogVidHeight * .9)) / ogVidHeight;
    var LH_MAX = .6
    if(rh > LH_MAX){rh = LH_MAX;}
    if(sineWave){
      sineWave.volume = lh*lh;
    }
  }
}

window.onclick = function() {
  let context = Pizzicato.context
  let source = context.createBufferSource()
  source.buffer = context.createBuffer(1, 1, 22050)
  source.connect(context.destination)
  source.start()


  sineWave = new Pizzicato.Sound({
    source: 'wave',
    options: {
      frequency: 440
    }
  });
  sineWave.volume = .2;
  sineWave.play();
}


function noteToFreq(note) {
    let a = 440; //frequency of A (coomon value is 440Hz)
    return (a / 32) * (2 ** ((note - 9) / 12));
}