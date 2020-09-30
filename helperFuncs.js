const dupeChecker = function (object, formString, thingToCheck, findKeyBoolean) {
  for (let keys in object) {
    if (object[keys][formString] === thingToCheck) {
      if (findKeyBoolean) {
        return keys;
      }
      return true;
    }
  }
  return false; 
};


module.exports = dupeChecker;