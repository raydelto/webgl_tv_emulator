const playButton = document.querySelector('.button');
const upVolumeButton = document.querySelector('.up');
const downVolumeButton = document.querySelector('.down');
const muteButton = document.querySelector('.mute');
const volumeDisplay = document.querySelector('.volume');
const tv = new TVRenderer();
const noise = new Noise();
let volume = 0;
tv.Off();

function toggleButtonsDisabled(active) {
  upVolumeButton.setAttribute('disabled', active);;
  downVolumeButton.setAttribute('disabled', active);
  muteButton.setAttribute('disabled', active);
}

function toggleMute(active) {
  muteButton.id = active ? '' : 'activated';
  muteButton.classList.remove(active ? 'unmute' : 'mute');
  muteButton.classList.add(active ? 'mute' : 'unmute');
}

function adjustVolumePercentage(volume) {
  volumeDisplay.innerHTML = `${volume}%`;
}

playButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if (eventTarget.classList.contains('play')) {
    toggleButtonsDisabled(false);
    adjustVolumePercentage(volume = 100);
    tv.On();
    eventTarget.classList.remove('play');
    eventTarget.classList.add('pause');
    noise.play();
  } else {
    toggleButtonsDisabled(true);
    adjustVolumePercentage(volume = 0);
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
})

downVolumeButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if(eventTarget.getAttribute('disabled') === 'false') {
    toggleMute(true);
    if (noise.decrease()) {
      adjustVolumePercentage(volume -= 5);
    }
  }
});

upVolumeButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if(eventTarget.getAttribute('disabled') === 'false') {
    toggleMute(true);
    if (noise.increase()) {
      adjustVolumePercentage(volume += 5);
    }
  }
});

toggleButtonsDisabled(true);
