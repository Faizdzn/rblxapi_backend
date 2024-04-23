let RBX = require("./lib/rblx.js");
RBX = new RBX('./cdn');

async function testApi() {
  try {
    const gameDT = await RBX.getGroupDetail(17283984)

    console.log(gameDT);
  } catch(err) {
    console.error(err);
  }
}

testApi()