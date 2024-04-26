const path = require("path");
const fs = require("fs");
// const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../config.json"))).cdnDir;
const config = process.env.CDNDIR;
let resp = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../lib/json/response.json"))).resp;

let RBX = require("../lib/rblx.js");
const RBXException = require("../lib/error.js");

RBX = new RBX(config);

class userController {
  async getUserAvatar(req, res, next) {
    const username = req.query.u;
    
    try {
      if(username == null || username.length < 1) {
        throw new RBXException("E_FIELDEMPTY");
      }
      
      const zipData = await RBX.zipUserObjtoBuffer(username);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=user_${username}.zip`);
  
      res.send(zipData);
    } catch(err) {
      next(err);
    }
  }
  
  async getUserDetail(req, res, next) {
    const username = req.query.u;
    
    try {
      if(username == null || username.length < 1) {
        throw new RBXException("E_FIELDEMPTY");
      }
      
      const uid = await RBX.getUIDbyUsername(username);
      const detail = await RBX.uidDetail(uid);
      
      resp['message'] = `Successfully catch ${username}'s detail!`;
      resp['data'] = detail;
      
      return res.json(resp);
    } catch(err) {
      next(err);
    }
  }
}

module.exports = new userController();