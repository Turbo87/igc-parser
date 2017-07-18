export function formatResult(result: any) {
  return `Start: ${formatTime(result.start.time)}\n` +
    `Time: ${formatTime(result.totalTime)}\n` +
    `Distance: ${(result.distance)} km\n` +
    `Speed: ${(result.speed)} km/h\n`;
}

export function formatTime(time: number) {
  let date = new Date(time);
  return date.toISOString();
}
