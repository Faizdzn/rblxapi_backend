const he = require("he");
const path = require("path");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../config.json")));

let RBX = require("../lib/obfuscated_rblx.js");
const RBXException = require("../lib/error.js");

RBX = new RBX(config.cookie, config.groupId, config.cdnDir)

class itemController {
  async getItem3D(req, res, next) {
    const item_id = parseInt(req.query.i);
    
    try {
      if(username == null || username.length < 1) {
        throw new RBXException("E_FIELDEMPTY");
      }
      
      const zipData = await RBX.zipItemObjtoBuffer(item_id);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=item_${item_id}.zip`);
  
      res.send(zipData);
    } catch(err) {
      next(err);
    }
  }
  
  async getItemDetail(req, res, next) {
    const itemId = parseInt(req.query.i);
    
    try {
      if(itemId == null || itemId == 0) {
        throw new RBXException("E_FIELDEMPTY");
      }
      
      const detail = await RBX.itemDetail(itemId);
      
      let resp = config.resp;
      resp['message'] = `Successfully catch ${itemId} asset detail!`;
      resp['data'] = detail;
      
      return res.json(resp);
    } catch(err) {
      next(err);
    }
  }
}

module.exports = new itemController();