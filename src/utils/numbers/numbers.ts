export function getLargerValue(value, maxValue) {
  if (value > maxValue) {
    return value;
  } else {
    return maxValue;
  }
}

export function getPercentageFromValue(value, maxValue) {
  return Math.round(100 / maxValue * value);
}
