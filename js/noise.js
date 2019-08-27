class Noise{

    constructor(){
    }

    init(){
	    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	    // Create an empty 100 seconds stereo buffer
	    const myArrayBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 100, this.audioContext.sampleRate);
	
	    // Fill the buffer with white noise;
	    // just random values between -1.0 and 1.0
	    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
	      // This gives us the actual array that contains the data
	      const nowBuffering = myArrayBuffer.getChannelData(channel);
	      for (var i = 0; i < myArrayBuffer.length; i++) {
	        // Math.random() is in [0; 1.0]
	        // audio needs to be in [-1.0; 1.0]
	        nowBuffering[i] = Math.random() * 2 - 1;
	      }
	    }
	
	    // Get an AudioBufferSourceNode.
	    // This is the AudioNode to use when we want to play an AudioBuffer
	    this.noiseSource = this.audioContext.createBufferSource();
	
		this.gainNode = this.audioContext.createGain();

	    // set the buffer in the AudioBufferSourceNode
		this.noiseSource.buffer = myArrayBuffer;
		this.noiseSource.connect(this.gainNode);
		this.gainNode.connect(this.audioContext.destination);
    }

    play() {
        this.init();

	    // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
	    this.noiseSource.connect(this.audioContext.destination);
	    this.noiseSource.start();
    }
    
    stop()
    {
        this.initialized = false;
        this.noiseSource.stop();
	}

	mute(activated)
	{
		this.initialized = false;
		this.gainNode.gain.value = activated ? -1 : 1;
	}
	
	decrease()
	{
		let result = false;
		this.initialized = result;
		if (this.gainNode.gain.value > -1) {
			this.gainNode.gain.value -= 0.1;
			result = true;
		}

		return result;
	}

	increase()
	{
		let result = false;
		this.initialized = result;
		if (this.gainNode.gain.value < 1) {
			this.gainNode.gain.value += 0.1;
			result = true;
		}

		return result;
	}
}
