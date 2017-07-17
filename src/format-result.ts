export function formatResult(result) {
  return `Start: ${formatTime(result.start.secOfDay)}\n` +
    `Time: ${formatTime(result.totalTime)}\n` +
    `Distance: ${(result.distance)} km\n` +
    `Speed: ${(result.speed)} km/h\n`;
}

export function formatTime(secOfDay) {
  let sec = secOfDay % 60;
  let min = ((secOfDay - sec) / 60) % 60;
  let hour = (secOfDay - sec - min * 60) / 3600;
  return `${hour}:${min}:${sec}`;
}
