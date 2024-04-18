function getHashUrl(hash) {
    let st = 31;
    for (let ii = 0; ii < hash.length; ii++) {
      st ^= hash[ii].charCodeAt(0);
    }
    return `https://t${(st % 8).toString()}.rbxcdn.com/${hash}`;
  };

function str_replace(find, replace, w) {
  var regex;
  for (var i = 0; i < find.length; i++) {
    regex = new RegExp(find[i], "g");
    w = w.replace(regex, replace[i]);
  }
  
  return w;
};

module.exports = { getHashUrl, str_replace };