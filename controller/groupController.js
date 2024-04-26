const path = require("path");
const fs = require("fs");
// const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../config.json"))).cdnDir;
const config = process.env.CDNDIR;
let resp = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../lib/json/response.json"))).resp;

let RBX = require("../lib/rblx.js");
const RBXException = require("../lib/error.js");

RBX = new RBX(config);

class groupController {
  async getDetail(req, res, next) {
    const gid = req.query.g;
    
    try {
      if(gid == null || gid.length < 1) {
        throw new RBXException("E_FIELDEMPTY");
      }
      
      const groupDT = await RBX.getGroupDetail(gid);
      resp['message'] = `Successfully catch ${gid} group detail!`;
      resp['data'] = groupDT;
      
      return res.json(resp)
    } catch(err) {
      next(err);
    }
  }
}

module.exports = new groupController();