function playNoise() {

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    const myArrayBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 100, audioContext.sampleRate);

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
    const noiseSource = audioContext.createBufferSource();

    // set the buffer in the AudioBufferSourceNode
    noiseSource.buffer = myArrayBuffer;

    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    noiseSource.connect(audioContext.destination);
    noiseSource.start();
}