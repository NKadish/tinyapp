const dupeEmailChecker = function (object, email) {
  for (let keys in object) {
    if (object[keys].email === email) {
      return true;
    }
  }
  return false; 
}

module.exports = dupeEmailChecker;