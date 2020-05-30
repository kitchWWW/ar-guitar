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
var CHOSEN_INSTURMENT = '';
var distortion;
var flanger;
var quadrafuzz;

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
var flying_1d = new Pizzicato.Sound('res_audio/flying/eDown.wav', function() {});
var flying_1u = new Pizzicato.Sound('res_audio/flying/eUp.wav', function() {});
var flying_2d = new Pizzicato.Sound('res_audio/flying/aDown.wav', function() {});
var flying_2u = new Pizzicato.Sound('res_audio/flying/aUp.wav', function() {});
var flying_3d = new Pizzicato.Sound('res_audio/flying/bDown.wav', function() {});
var flying_3u = new Pizzicato.Sound('res_audio/flying/bUp.wav', function() {});

var acoustic_1d = new Pizzicato.Sound('res_audio/acoustic/gDown.wav', function() {});
var acoustic_1u = new Pizzicato.Sound('res_audio/acoustic/gUp.wav', function() {});
var acoustic_2d = new Pizzicato.Sound('res_audio/acoustic/cDown.wav', function() {});
var acoustic_2u = new Pizzicato.Sound('res_audio/acoustic/cUp.wav', function() {});
var acoustic_3d = new Pizzicato.Sound('res_audio/acoustic/dDown.wav', function() {});
var acoustic_3u = new Pizzicato.Sound('res_audio/acoustic/dUp.wav', function() {});

var metal_1d = new Pizzicato.Sound('res_audio/metal/eDown.wav', function() {});
var metal_1u = new Pizzicato.Sound('res_audio/metal/eUp.wav', function() {});
var metal_2d = new Pizzicato.Sound('res_audio/metal/fDown.wav', function() {});
var metal_2u = new Pizzicato.Sound('res_audio/metal/fUp.wav', function() {});
var metal_3d = new Pizzicato.Sound('res_audio/metal/bDown.wav', function() {});
var metal_3u = new Pizzicato.Sound('res_audio/metal/bUp.wav', function() {});


function stopAll() {
  try {
    chord_1d.stop();
  } catch {}
  try {
    chord_1u.stop();
  } catch {}
  try {
    chord_2d.stop();
  } catch {}
  try {
    chord_2u.stop();
  } catch {}
  try {
    chord_3d.stop();
  } catch {}
  try {
    chord_3u.stop();
  } catch {}
}


function preload() {
  img_flying = loadImage('res_img/flying.png');
  img_acoustic = loadImage('res_img/acoustic.png');
  img_metal = loadImage('res_img/metal.png');
  img = img_flying;
}


function chooseInsturment(choice) {
  CHOSEN_INSTURMENT = choice;
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
  console.log(choice);
  if (choice == 'flying') {
    img = img_flying;
    chord_1d = flying_1d;
    chord_1u = flying_1u;
    chord_2d = flying_2d;
    chord_2u = flying_2u;
    chord_3d = flying_3d;
    chord_3u = flying_3u;

    var group = new Pizzicato.Group([chord_1d, chord_1u, chord_2d, chord_2u, chord_3d, chord_3u]);
    distortion = new Pizzicato.Effects.Distortion({
      gain: 0.4
    });
    group.addEffect(distortion);
  } else if (choice == 'metal') {
    img = img_metal
    chord_1d = metal_1d;
    chord_1u = metal_1u;
    chord_2d = metal_2d;
    chord_2u = metal_2u;
    chord_3d = metal_3d;
    chord_3u = metal_3u;
    var group = new Pizzicato.Group([chord_1d, chord_1u, chord_2d, chord_2u, chord_3d, chord_3u]);
    quadrafuzz = new Pizzicato.Effects.Quadrafuzz({
      lowGain: 0.6,
      midLowGain: 0.8,
      midHighGain: 0.7,
      highGain: 0.6,
      mix: 1.0
    });
    group.addEffect(quadrafuzz);

  } else { // acoustic
    img = img_acoustic
    chord_1d = acoustic_1d;
    chord_1u = acoustic_1u;
    chord_2d = acoustic_2d;
    chord_2u = acoustic_2u;
    chord_3d = acoustic_3d;
    chord_3u = acoustic_3u;
    var group = new Pizzicato.Group([chord_1d, chord_1u, chord_2d, chord_2u, chord_3d, chord_3u]);

    flanger = new Pizzicato.Effects.Flanger({
      time: 0.45,
      speed: 0.2,
      depth: 0.1,
      feedback: 0.1,
      mix: 0.5
    });
    group.addEffect(flanger);

  }
  canPlay = true;
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
lwy = 400;
lwx = 400;

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

    lwx_raw = pose.leftWrist.x;
    lwy_raw = pose.leftWrist.y;
    rwx = pose.rightWrist.x;
    rwy = pose.rightWrist.y;
    rhx = ((pose.rightHip.x - guitar_len * .05) * .1) + (rhx * .9);
    rhy = ((pose.rightHip.y - guitar_len * .05) * .1) + (rhy * .9);
    nx = pose.nose.x;
    ny = pose.nose.y;
    lwx = (lwx_raw * .1) + (lwx * .9);
    lwy = (lwy_raw * .1) + (lwy * .9);

    // we want to change distances quickly, but guitar verticality should be smoothed.
    var dist_lhFromHip = Math.sqrt(Math.pow((lwx_raw - rhx), 2) + Math.pow((lwy_raw - rhy), 2));



    var dist_rwFromHip = Math.sqrt(Math.pow((rwx - rhx), 2) + Math.pow((rwy - rhy), 2));
    var dist_nFromHip = Math.sqrt(Math.pow((nx - rhx), 2) + Math.pow((ny - rhy), 2));


    guitar_len = (dist_nFromHip * 1.8) * .1 + (guitar_len * .9);
    mark1 = .48;
    mark2 = .35;

    var guitarAngleDeg = Math.atan2(lwy - rhy, lwx - rhx) * 180 / Math.PI;

    var gainUpdate = Math.abs(guitarAngleDeg + 15) / 90.0;
    if (gainUpdate > 1) {
      gainUpdate = 1 - gainUpdate
    };
    if (canPlay) {
      if (CHOSEN_INSTURMENT == 'flying') {
        distortion.gain = gainUpdate * gainUpdate;
      } else if (CHOSEN_INSTURMENT == 'acoustic') {
        flanger.mix = gainUpdate * gainUpdate;
      }else{//else metal
        quadrafuzz.lowGain = gainUpdate * gainUpdate;
        quadrafuzz.midLowGain = gainUpdate * gainUpdate;
        quadrafuzz.midHighGain = gainUpdate * gainUpdate;
        quadrafuzz.highGain = gainUpdate * gainUpdate;
      }

    }

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
              chord_1u.play(0);
            } else if (dist_lhFromHip > guitar_len * mark2) {
              stopAll();
              chord_2u.play(0);
            } else {
              stopAll();
              chord_3u.play(0);
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
              chord_1d.play(0);
            } else if (dist_lhFromHip > guitar_len * mark2) {
              stopAll();
              chord_2d.play(0);
            } else {
              stopAll();
              chord_3d.play(0);
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