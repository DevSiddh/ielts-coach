export function formatBand(value: number) {
  return value ? `${value.toFixed(1)} / 9.0` : "-";
}

export function formatDuration(seconds: number) {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}
