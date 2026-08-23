var Sburb = (function (Sburb) {
  Sburb.globalVolume = 1;
  Sburb.audioContext = null;
  Sburb.masterGain = null;
  Sburb.audioUnlocked = false;
  Sburb.pendingAudio = [];

  ///////////////////////////////////////
  //Sound Class
  ///////////////////////////////////////

  //Constructor
  Sburb.Sound = function (asset) {
    this.asset = asset;
  };

  Sburb.connectAudio = function (asset) {
    //initialize audio
    if (!Sburb.audioContext) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        Sburb.audioContext = new AudioContext();
        Sburb.masterGain = Sburb.audioContext.createGain();
        Sburb.masterGain.gain.value = Sburb.globalVolume;
        Sburb.masterGain.connect(Sburb.audioContext.destination);
      }
    }
    if (!Sburb.audioContext) return;
    //assuming master gain node was created successfully,
    //route the audio element through the master gain node (if not done already)
    if (!asset.gainNodeRoute) {
      asset.gainNodeRoute = Sburb.audioContext.createMediaElementSource(asset);
      asset.gainNodeRoute.connect(Sburb.masterGain);
    }
  };

  //play this sound
  Sburb.Sound.prototype.play = function (pos) {
    this.asset.pendingPlay = false;
    Sburb.connectAudio(this.asset);
    if (pos) {
      // chrome doesnt like us changing the play time
      // unless we're already playing
      var oThis = this;
      this.asset.addEventListener(
        "playing",
        function () {
          oThis.asset.currentTime = pos;
          oThis.asset.pause();
          oThis.asset.removeEventListener("playing", arguments.callee);
          oThis.asset.play();
        },
        false,
      );
    }
    this.fixVolume();
    this.asset.play();
  };

  //pause this sound
  Sburb.Sound.prototype.pause = function () {
    this.asset.pause();
    //console.log("pausing the sound...");
  };

  //stop this sound
  Sburb.Sound.prototype.stop = function () {
    this.pause();
    this.asset.currentTime = 0;
    //console.log("stopping the sound...");
  };

  //has the sound stopped
  Sburb.Sound.prototype.ended = function () {
    return this.asset.ended;
  };

  //ensure the sound is playing at the global volume
  Sburb.Sound.prototype.fixVolume = function () {
    if (Sburb.masterGain) {
      Sburb.masterGain.gain.value = Sburb.globalVolume;
    } else {
      //old volume method left here just in case
      this.asset.volume = Sburb.globalVolume;
      //console.log("fixing the volume...");
    }
  };

  /////////////////////////////////////
  //BGM Class (inherits Sound)
  /////////////////////////////////////

  //constructor
  Sburb.BGM = function (asset, startLoop, priority) {
    Sburb.Sound.call(this, asset);
    this.startLoop = 0;
    this.endLoop = 0;
    Sburb.connectAudio(this.asset);
    this.setLoopPoints(startLoop ? startLoop : 0);
  };

  Sburb.BGM.prototype = new Sburb.Sound();

  //set the points in the sound to loop
  Sburb.BGM.prototype.setLoopPoints = function (start, end) {
    var tmpAsset = this.asset;
    tmpAsset.addEventListener(
      "ended",
      function () {
        //	console.log("I'm loopin' as hard as I can cap'n! (via event listener)");
        tmpAsset.currentTime = start;
        tmpAsset.play();
      },
      false,
    );
    this.startLoop = start;
    this.endLoop = end;
    // do we need to have an end point? does that even make sense
  };

  //loop the sound
  Sburb.BGM.prototype.loop = function () {
    //	console.log("looping...");
    this.play(this.startLoop);
  };

  Sburb.unlockAudio = async function () {
    if (!Sburb.audioUnlocked && Sburb.bgm) {
      if (!Sburb.audioContext) {
        //create audio context with gain node
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          Sburb.audioContext = new AudioContext();
          Sburb.masterGain = Sburb.audioContext.createGain();
          Sburb.masterGain.gain.value = Sburb.globalVolume;
          Sburb.masterGain.connect(Sburb.audioContext.destination);
        }
        if (!Sburb.audioContext) return;
      }
      await Sburb.audioContext.resume();
      //create silent audio and play it, then unlock audio
      const source = Sburb.audioContext.createBufferSource();
      source.buffer = Sburb.audioContext.createBuffer(1, 1, 22050);
      source.connect(Sburb.audioContext.destination);
      source.start(0);
      Sburb.audioUnlocked = true;
      Sburb.retryPendingAudio();
    }
  };

  Sburb.queuePendingAudio = function (sound) {
    if (Sburb.pendingAudio.indexOf(sound) === -1) {
      Sburb.pendingAudio.push(sound);
    }
  };

  return Sburb;
})(Sburb || {});
