// function that looks at the keys and the the specified form of that key, and checks to see if it has the value of thingToCheck
// I know functions are only supposed to do one thing, but I couldn't quite puzzle out how to get the id of the key which had matching values, so if you set findKeyBoolean to true it will tell you which key the matching value was found in
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