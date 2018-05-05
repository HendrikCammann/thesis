export function getKeys(array): any {
  let keys = [];
  for (let key in array) {
    keys.push(key);
  }

  return keys;
}

export function sumArray(array: any[]) {
  return array.reduce(function(pv, cv) { return pv + cv; }, 0);
}
