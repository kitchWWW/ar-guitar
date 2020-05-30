// ml5.js: Pose Estimation with PoseNet
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/7.1-posenet.html
// https://youtu.be/OIo-DIOkNVg
// https://editor.p5js.org/codingtrain/sketches/ULA97pJXR



// const btn = document.getElementById('myButton');
// const chunks = [];
// console.log(btn);

// function record() {
//   chunks.length = 0;
//   let stream = document.querySelector('canvas').captureStream(30),
//     recorder = new MediaRecorder(stream);
//   recorder.ondataavailable = e => {
//     if (e.data.size) {
//       chunks.push(e.data);
//     }
//   };
//   recorder.onstop = exportVideo;
//   btn.onclick = e => {
//     recorder.stop();
//     btn.textContent = 'start recording';
//     btn.onclick = record;
//   };
//   recorder.start();
//   btn.textContent = 'stop recording';
// }

// function exportVideo(e) {
//   var blob = new Blob(chunks);
//   var vid = document.createElement('video');
//   vid.id = 'recorded'
//   vid.controls = true;
//   vid.src = URL.createObjectURL(blob);
//   document.body.appendChild(vid);
//   vid.play();
// }
// btn.onclick = record;

var canPlay = false;
var shouldPlay = false;
var justPlayed = false;

let video;
let poseNet;
let pose;
let skeleton;

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  ogWidth = video.width;
  ogHeight = video.height;
  var porportion = windowWidth / ogWidth
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

}
var eDown = new Pizzicato.Sound('eDown.wav', function() {});
var eUp = new Pizzicato.Sound('eUp.wav', function() {});
var aDown = new Pizzicato.Sound('aDown.wav', function() {});
var aUp = new Pizzicato.Sound('aUp.wav', function() {});
var bDown = new Pizzicato.Sound('bDown.wav', function() {});
var bUp = new Pizzicato.Sound('bUp.wav', function() {});

var group = new Pizzicato.Group([eDown, eUp, aDown, aUp, bDown, bUp]);

var distortion = new Pizzicato.Effects.Distortion({
    gain: 0.4
});
group.addEffect(distortion);


function stopAll(){
  try{eDown.stop();}catch{}
  try{eUp.stop();}catch{}
  try{aDown.stop();}catch{}
  try{aUp.stop();}catch{}
  try{bDown.stop();}catch{}
  try{bUp.stop();}catch{}
}


function preload() {
  img = loadImage('guitar.png');

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
rhx = 500;
rhy = 500;

function draw() {
  background(255);
  image(video, 0, 0);

  if (pose) {
    MIN_CONFIDENCE = .01;
    if (pose.leftWrist.confidence > MIN_CONFIDENCE &
      pose.rightWrist.confidence > MIN_CONFIDENCE &
      pose.rightHip.confidence > MIN_CONFIDENCE) {
      shouldPlay = true;
    } else {
      shouldPlay = false;

    }

    lwx = pose.leftWrist.x;
    lwy = pose.leftWrist.y;
    rwx = pose.rightWrist.x;
    rwy = pose.rightWrist.y;
    rhx = ((pose.rightHip.x-guitar_len*.05) * .1) + (rhx * .9);
    rhy = ((pose.rightHip.y-guitar_len*.05) * .1) + (rhy * .9);
    nx = pose.nose.x;
    ny = pose.nose.y;


    var dist_lhFromHip = Math.sqrt(Math.pow((lwx - rhx), 2) + Math.pow((lwy - rhy), 2));
    var dist_rwFromHip = Math.sqrt(Math.pow((rwx - rhx), 2) + Math.pow((rwy - rhy), 2));
    var dist_nFromHip = Math.sqrt(Math.pow((nx - rhx), 2) + Math.pow((ny - rhy), 2));


    guitar_len = (dist_nFromHip * 1.8) * .1 + (guitar_len * .9);
    mark1 = .48;
    mark2 = .35;

    var guitarAngleDeg = Math.atan2(lwy - rhy, lwx - rhx) * 180 / Math.PI;

    var gainUpdate = Math.abs(guitarAngleDeg+15) / 90.0;
    if(gainUpdate>1){gainUpdate = 1-gainUpdate};
    distortion.gain = gainUpdate * gainUpdate;

    var strumAngleDeg = Math.atan2(rwy - rhy, rwx - rhx) * 180 / Math.PI;


    var above = guitarAngleDeg > strumAngleDeg;

    guitarHeadx = Math.cos(guitarAngleDeg * Math.PI / 180) * guitar_len + rhx
    guitarHeady = Math.sin(guitarAngleDeg * Math.PI / 180) * guitar_len + rhy


    strokeWeight(5);
    stroke(0);
    // line(rhx, rhy, guitarHeadx, guitarHeady);
    // line(rhx, rhy, rwx, rwy);


    angleMode(DEGREES); // Change the mode to DEGREES
    translate(rhx, rhy);
    //translate(rhx,rhy);
    rotate(guitarAngleDeg);
    translate(-1 * (guitar_len * .25), -1 * (guitar_len * .21));
    image(img, 0, 0, guitar_len, guitar_len * .42);
    if (previouslyAbove == null) {
      previouslyAbove = above;
    } else {
      if (previouslyAbove != above && (Math.abs(strumAngleDeg) < 100 || dist_rwFromHip < guitar_len * .1)) {
        if (above == true) {
          console.log("PLAY up  strum");
          console.log(shouldPlay);
          console.log(canPlay);
          console.log(justPlayed);
          
          if (shouldPlay && canPlay && (!justPlayed)) {
            if (dist_lhFromHip > guitar_len * mark1) {
              stopAll();
              eUp.play(0);
            } else if (dist_lhFromHip > guitar_len * mark2) {
              stopAll();
              aUp.play(0);
            } else {
              stopAll();
              bUp.play(0);
            }
            justPlayed = true;
            setTimeout(function() {
              justPlayed = false;
            }, 100);
          }
        } else {
          console.log("PLAY down strum");
          if (shouldPlay && canPlay && (!justPlayed)) {
            if (dist_lhFromHip > guitar_len * mark1) {
              stopAll();
              eDown.play(0);
            } else if (dist_lhFromHip > guitar_len * mark2) {
              stopAll();
              aDown.play(0);
            } else {
              stopAll();
              bDown.play(0);
            }
            justPlayed = true;
            setTimeout(function() {
              justPlayed = false;
            }, 100);
          }
        }
      }
      previouslyAbove = above;
    }
  }

}