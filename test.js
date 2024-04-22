let RBX = require("./lib/rblx.js");
RBX = new RBX('./cdn');

async function testApi() {
  try {
    const gameDT = await RBX.getGameDetail(4559228783)
    
    console.log(gameDT);
  } catch(err) {
    console.error(err);
  }
}

testApi()