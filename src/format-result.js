function formatResult(result) {
  return `Start: ${formatTime(result.start.secOfDay)}\nTime: ${formatTime(result.totalTime)}`;
}

function formatTime(secOfDay) {
  let sec = secOfDay % 60;
  let min = ((secOfDay - sec) / 60) % 60;
  let hour = (secOfDay - sec - min * 60) / 3600;
  return `${hour}:${min}:${sec}`;
}

module.exports = formatResult;
