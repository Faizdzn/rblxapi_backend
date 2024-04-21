require("dotenv").config()

const fs = require("fs");
const path = require("path");
// const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./config.json")));
const config = process.env;
const RBXException = require("./lib/error.js");

const express = require("express");
const cors = require("cors");
const app = express();

app.set('json spaces', 2)
app.use(cors({
  "origin": config.APIORIGIN
}))

app.use("/cdn", express.static("./cdn"))
app.use("/api", require("./routes/api.js"))

app.all("/*", (req, res, next) => {
  throw new RBXException("E_PAGENOTFOUND")
})

app.use((err, req, res, next) => {
  if(err.json != null) {
    res.status(err.json['error']['status']).json(err.json);
  } else {
    // const code = "E_SERVER"
    // const resp =
    // {
    //   error: {
    //     code: code,
    //     message: config.error['code'][code][0],
    //     status: config.error['code'][code][1]
    //   }
    // };
    
    // console.error(err)
    // res.status(resp['status']).json(resp);
    throw new RBXException("E_SERVER");
  }
})

app.listen(config.PORT, () => {
  console.log(`${config.SERVERNAME} running in ${config.PORT}`)
})
