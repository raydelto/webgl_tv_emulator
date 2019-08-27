const playButton = document.querySelector('.button');
const tv = new TVRenderer();
const noise = new Noise();

tv.Off();

playButton.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if (eventTarget.classList.contains('play')) {
    tv.On();
    eventTarget.classList.remove('play');
    eventTarget.classList.add('pause');
    noise.play();
  } else {
    tv.Off();
    eventTarget.classList.remove('pause');
    eventTarget.classList.add('play');
    noise.stop();
  }
});
