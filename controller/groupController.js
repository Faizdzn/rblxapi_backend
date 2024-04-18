const he = require("he");
const path = require("path");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../config.json")));

let RBX = require("../lib/obfuscated_rblx.js");
const RBXException = require("../lib/error.js");

RBX = new RBX(config.cookie, config.groupId, config.cdnDir)

class groupController {
  async getDetail(req, res, next) {
    try {
      const detail = await RBX.getGroupDetail();
      
      let resp = config.resp;
      resp['message'] = `Successfully catch the group detail!`;
      resp['data'] = detail;
      
      return res.json(resp);
    } catch(err) {
      next(err);
    }
  }
}

module.exports = new groupController();