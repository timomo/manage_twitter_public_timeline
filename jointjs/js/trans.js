/**
 * 指定文字列の多言語対応
 * @param {String} key 文字列
 * @returns {String} 他言語文字列
 */
function trans(key)
{
  var map = {
    'messages.button.recreate-graph': 'recreate-graph',
    'messages.button.tojson': 'tojson',
    'messages.button.fromjson': 'fromjson',
    'messages.button.add-plugin': 'add-plugin',
    'messages.button.update': 'update',
    'messages.button.cancel': 'cancel',
    'messages.button.create': 'create',
  };

  if (map.hasOwnProperty(key) === false) {
    return key;
  }

  return map[key];
}
