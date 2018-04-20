export function getKeys(array): any {
  let keys = [];
  for (let key in array) {
    keys.push(key);
  }

  return keys;
}
