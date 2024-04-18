const fs = require("node:fs");
const path = require("path");
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../config.json")));

let Errors = config.error['code']

class RBXException extends Error {
  constructor(err) {
    super(err)
    
    if(err in Errors) {
      this.name = err;
      this.message = Errors[this.name][0];
      this.json =
      {
        error: {
          code: this.name,
          message: this.message,
          status: parseInt(Errors[this.name][1])
        }
      };
    } else {
      this.name = "E_ERRNOTFOUND";
      this.message = Errors[this.name][0];
      this.json =
      {
        error: {
          code: this.name,
          message: this.message,
          status: parseInt(Errors[this.name][1])
        }
      };
    }
  }
}

module.exports = RBXException;