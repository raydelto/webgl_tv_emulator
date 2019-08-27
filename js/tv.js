const playButton = document.querySelector('.button');
const upVolumeButton = document.querySelector('.volume > .up');
const downVolumeButton = document.querySelector('.volume > .down');
const upChannelButton = document.querySelector('.channel > .up');
const downChannelButton = document.querySelector('.channel > .down');
const muteButton = document.querySelector('.mute');
const volumeDisplayer = document.querySelector('.volume-displayer');
const channelDisplayer = document.querySelector('.channel-displayer');

const tv = new TVRenderer();
const noise = new Noise();

const MIN_CHANNEL = 1, MAX_CHANNEL = 99;
let volume = 0, channel = '';

tv.Off();

function toggleButtonsDisabled(active) {
  upVolumeButton.setAttribute('disabled', active);
  downVolumeButton.setAttribute('disabled', active);
  upChannelButton.setAttribute('disabled', active);
  downChannelButton.setAttribute('disabled', active);
  muteButton.setAttribute('disabled', active);
}

function toggleMute(active) {
  muteButton.id = active ? '' : 'activated';
  muteButton.classList.remove(active ? 'unmute' : 'mute');
  muteButton.classList.add(active ? 'mute' : 'unmute');
}

function changeChannel(channel) {
  // TODO TV should blink
  channelDisplayer.innerHTML = channel;
  // Hide channel number after 15 seconds
  if (channel !== '') {
    setTimeout(function() {
      channelDisplayer.innerHTML = '';
    }, 15000);
  }
}

function adjustVolumePercentage(volume) {
  volumeDisplayer.innerHTML = `${volume}%`;
}

playButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if (eventTarget.classList.contains('play')) {
    toggleButtonsDisabled(false);
    adjustVolumePercentage(volume = 100);
    changeChannel(channel = (channel === '') ? '1' : channel);
    tv.On();
    eventTarget.classList.remove('play');
    eventTarget.classList.add('pause');
    noise.play();
  } else {
    toggleButtonsDisabled(true);
    adjustVolumePercentage(volume = 0);
    changeChannel('');
    toggleMute(true);
    tv.Off();
    eventTarget.classList.remove('pause');
    eventTarget.classList.add('play');
    noise.stop();
  }
});

muteButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if(eventTarget.getAttribute('disabled') === 'false') {
    if(eventTarget.id == '') {
      eventTarget.id = 'activated';
      adjustVolumePercentage(volume = 0);
      toggleMute(false);
    } else {
      eventTarget.id = '';
      toggleMute(true);
    }
    noise.mute(eventTarget.id === 'activated');
  }
});

upVolumeButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if (eventTarget.getAttribute('disabled') === 'false') {
    toggleMute(true);
    if (noise.increase()) {
      adjustVolumePercentage(volume += 5);
    }
  }
});

downVolumeButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if(eventTarget.getAttribute('disabled') === 'false') {
    toggleMute(true);
    if (noise.decrease()) {
      adjustVolumePercentage(volume -= 5);
    }
  }
});

upChannelButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if (eventTarget.getAttribute('disabled') === 'false') {
    channel = ((parseInt(channel) < MAX_CHANNEL)
      ? parseInt(channel) + 1 : MIN_CHANNEL).toString();
    changeChannel(channel);
  }
});

downChannelButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if (eventTarget.getAttribute('disabled') === 'false') {
    channel = ((parseInt(channel) > MIN_CHANNEL)
      ? parseInt(channel) - 1 : MAX_CHANNEL).toString();
    changeChannel(channel);
  }
});

toggleButtonsDisabled(true);
