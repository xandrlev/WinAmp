const formatTime = (time) => (time < 10 ? `0${time}` : time);

export const toMinSec = (duration) => {
  const minutes = formatTime(Math.floor(duration / 60));
  const sec = formatTime(Math.floor(duration - minutes * 60));
  return `${minutes}:${sec}`;
};

export const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
