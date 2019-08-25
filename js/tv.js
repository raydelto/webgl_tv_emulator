const playButton = document.querySelector('.button');
const audio = new Audio('./audio/static.mp3');
audio.onended = () => {
    audio.currentTime = 0
    audio.play()
}
const TV = new TVRenderer()
TV.Off()
playButton.addEventListener('click', (e) => {
  const tgt = e.target;
  if (tgt.classList.contains('play')) {
    TV.On()
    tgt.classList.remove('play');
    tgt.classList.add('pause');
    audio.play()
  } else {
    TV.Off()
    audio.pause()
    audio.currentTime = 0
    tgt.classList.remove('pause');
    tgt.classList.add('play');
  }
});