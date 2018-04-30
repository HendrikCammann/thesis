export function getWeeksBetweenDates(end, start) {
  end = new Date(end);
  start = new Date(start);
  return {
    range: Math.round((end - start) / (7 * 24 * 60 * 60 * 1000)),
    type: 'Weeks'
  };
}
