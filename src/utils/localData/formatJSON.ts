const blackList = ['index', 'id', 'name', 'date', 'updated_at', 'created_at'];
const killList = ['index', 'updated_at', 'created_at'];

export function reformatJSON(data) {
  for (let item in data) {
    for (let key in data[item]) {
      if (blackList.indexOf(key) < 0) {
        data[item][key] = JSON.parse(data[item][key]);
      }
    }
  }

  for (let item in data) {
    for (let key in data[item]) {
      if (killList.indexOf(key) >= 0) {
        delete data[item][key];
      }
    }
  }
  
  return data;
}
