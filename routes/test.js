const fs = require("node:fs");
const config = JSON.parse(fs.readFileSync("../../config.json"));

const RBX = require("../lib/rblx.js");
const RBXException = require("../lib/error.js");
const axios = require("axios");

const rbx = new RBX(config.cookie, config.groupId, config.cdnDir)
// 13385995765
rbx.getGroupDetail().then((e) => {
  console.log(e);
}).catch((err) => {
  console.error(err)
})