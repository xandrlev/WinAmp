const formatTime = (time) => (time < 10 ? `0${time}` : time);

export const toMinSec = (duration) => {
  const minutes = formatTime(Math.floor(duration / 60));
  const sec = formatTime(Math.floor(duration - minutes * 60));
  return `${minutes}:${sec}`;
};
