export default function getTimeFromMs(ms) {
  const date = new Date(ms);

  return `${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
}
