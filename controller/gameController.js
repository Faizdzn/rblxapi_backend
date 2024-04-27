const path = require("path");
const fs = require("fs");
// const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../config.json"))).cdnDir;
const config = process.env.CDNDIR;
let resp = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../lib/json/response.json"))).resp;

let RBX = require("../lib/rblx.js");
const RBXException = require("../lib/error.js");

RBX = new RBX(config);

class gameController {
  async getDetail(req, res, next) {
    const univ_id = req.query.u;
    
    try {
      if(univ_id == null || univ_id.length < 1) {
        throw new RBXException("E_FIELDEMPTY");
      }
      
      const gameDT = await RBX.getGameDetail(univ_id);
      resp['message'] = `Successfully catch ${univ_id} game detail!`;
      resp['data'] = gameDT;
      
      return res.json(resp)
    } catch(err) {
      next(err);
    }
  }
}

module.exports = new gameController();