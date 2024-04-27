const util = require("util");
let path = require("path");
let axios = require("axios");
const jszip = require("jszip");
const fs = require("fs").promises;
const exec = util.promisify(require("child_process").exec);

const { getHashUrl, str_replace } = require("./global.js");
const RBXException = require("./error.js");

class RBX {
  constructor(dir) {
    this.dir = path.resolve(__dirname, dir);
  }
  
  // Group Section
  async getGroupDetail(gid) {
    // https://groups.roblox.com/v1/groups/17283984
    const id = parseInt(gid);
    const groupApi = `https://groups.roblox.com/v1/groups/${id}`;
    
    try {
      let { data } = await axios.get(groupApi);
      
      if(data.length < 1) {
        throw new RBXException("E_GROUPNOTFOUND");
      }
      
      data['games'] = await this.getGroupGames(id);
      let playing = 0;
      let visit = 0;
      let fav = 0;
      
      data['games'].forEach((data) => {
        playing += data['playing'];
      })
      data['games'].forEach((data) => {
        visit += data['visits'];
      })
      data['games'].forEach((data) => {
        fav += data['favoritedCount'];
      })
      
      data['totalGameActivePlay'] = playing;
      data['totalGameVisit'] = visit;
      data['totalGameFav'] = fav;
      data['groupIcon'] = await this.getGroupIcon(id);
      return data;
      console.log(data);
    } catch(err) {
      throw err;
    }
  }
  
  async getGroupGames(gid) {
    const id = parseInt(gid);
    const gameApi = `https://games.roblox.com/v2/groups/${id}/games?accessFilter=Public&cursor=&limit=50&sortOrder=Desc`;
    
    try {
      const { data } = await axios.get(gameApi);
      
      if(data['data'].length < 1) {
        // throw new RBXException("E_GAMENOTFOUND");
        return [];
      } else {
        const gameDT = await Promise.all(data['data'].map(async(data) => {
          const gameId = data['id'];
          const api = await this.getGameDetail(gameId);
          
          return api;
        }))
        
        return gameDT;
      }
    } catch(err) {
      throw err;
    }
  }
  
  async getGroupIcon(gid) {
    const api = `https://thumbnails.roblox.com/v1/batch`;
    const id = parseInt(gid);
    
    const payload = [
      {
        "requestId": `${id}:undefined:GroupIcon:150x150:webp:regular`,
        "type": "GroupIcon",
        "targetId": id,
        "format": "webp",
        "size": "150x150"
      }
    ]
    
    try {
      const { data } = await axios.post(api, payload);
      
      return data['data'][0]['imageUrl'];
    } catch(err) {
      throw err;
    }
  }
  
  // Game Section
  async getUnivID(game_id) {
    const id = parseInt(game_id);
    const api = `https://games.roblox.com/v1/games/multiget-playability-status?universeIds=${id}`;
    
    try {
      const { data } = await axios.get(api);
      
      if(data.length < 1) {
        throw new RBXException("E_GAMENOTFOUND");
      } else {
        return data['universeId']
      }
    } catch(err) {
      throw err
    }
  }
  
  async getGameDetail(game_id) {
    const id = parseInt(game_id);
    
    try {
      const univ = await this.getUnivID(id);
      
      const gameApi = `https://games.roblox.com/v1/games?universeIds=${univ}`;
      const { data } = await axios.get(gameApi);
      
      if(data['data'].length < 1) {
        throw new RBXException("E_GAMENOTFOUND");
      } else {
        let res = data.data[0];
        res['gameIcon'] = await this.getGameIcon(res['id']);
        return res;
      }
    } catch(err) {
      throw err;
    }
  }
  
  async getGameIcon(u_id) {
    const api = `https://thumbnails.roblox.com/v1/batch`;
    const id = parseInt(u_id);
    
    const payload = [
      {
        "requestId": `${id}:undefined:GameIcon:150x150:webp:regular`,
        "type": "GameIcon",
        "targetId": id,
        "format": "webp",
        "size": "150x150"
      }
    ]
    
    try {
      const { data } = await axios.post(api, payload);
      
      return data['data'][0]['imageUrl'];
    } catch(err) {
      throw err;
    }
  }
  
  // User Section
  async getUIDbyUsername(username) {
    const apiSearch = `https://www.roblox.com/search/users/results?keyword=${username}&maxRows=12&startIndex=0`;
    
    try {
      const { data } = await axios.get(apiSearch);
      
      if(data['UserSearchResults'] == null) {
        throw new RBXException("E_USERNOTFOUND");
      }
      
      return data['UserSearchResults'][0]['UserId'];
    } catch(err) {
      throw err;
    }
  }
  
  async uidDetail(uid) {
    const userApi = `https://users.roblox.com/v1/users/${parseInt(uid)}`;
    
    try {
      let { data } = await axios.get(userApi);
      const userShot = await this.getUserShot(data.id);
      
      data['imageUrl'] = userShot;
      
      return data;
    } catch(err) {
      throw err;
    }
  }
  
  async getUserShot(uid) {
    const batchApi = `https://thumbnails.roblox.com/v1/batch`;
    const bodyBatch = [{
      "requestId": `${parseInt(uid)}::Avatar:352x352:webp:regular`,
      "type": "Avatar",
      "targetId": parseInt(uid),
      "token": "",
      "format": "webp",
      "size": "352x352"
    }];
    
    try {
      const { data } = await axios.post(batchApi, bodyBatch);
      
      return data["data"][0]["imageUrl"];
    } catch(err) {
      throw err;
    }
  }
  
  async getUserObj(uid) {
    const batchApi = `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${parseInt(uid)}`;
    
    try {
      const batchRes = await axios.get(batchApi);
      const { data } = await axios.get(batchRes.data['imageUrl']);
      
      const tex = data['textures'].map((e) => {
        return getHashUrl(e);
      });
      
      const texArr = {
        hash: data['textures'],
        url: tex
      };
      
      const res = {
        obj: getHashUrl(data.obj),
        mtl: getHashUrl(data.mtl),
        tex: texArr
      };
      
      return res;
    } catch(err) {
      throw err;
    }
  }
  
  async saveUserObj(username) {
    const dirFile = this.dir;
    
    try {
      const uid = await this.getUIDbyUsername(username)
      await this.uidDetail(uid);
    } catch(err) {
      // console.error(err)
      throw new RBXException("E_USERNOTFOUND");
    }
    
    try {
      await fs.stat(`${dirFile}/user/${username}`)
    } catch(err) {
      await exec(`cd ${dirFile}/user/ && mkdir ${username}`)
    }
    
    try {
      const uid = await this.getUIDbyUsername(username);
      const userObj = await this.getUserObj(uid);
      
      let objData = await axios({
        url: userObj.obj,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let mtlData = await axios({
        url: userObj.mtl,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let deHash_tex =  userObj.tex['hash'].map((data, index) => {
        index++;
        return `${username}_Tex${index}.png`
      })
      
      objData = objData.data;
      mtlData = str_replace(userObj.tex['hash'], deHash_tex, mtlData.data);
      // return mtlE;
      
      const texFile = userObj.tex['url'].map(async (data, index) => {
        let texData = await axios({
          url: data,
          method: 'get',
          responseType: 'arraybuffer'
        });
        
        await fs.writeFile(`${dirFile}/user/${username}/${deHash_tex[index]}`, Buffer.from(texData.data));
      })
      
      await Promise.all(texFile)
      await fs.writeFile(`${dirFile}/user/${username}/${username}.obj`, objData)
      await fs.writeFile(`${dirFile}/user/${username}/${username}.mtl`, mtlData)
      
      const texDetail = deHash_tex.map((data) => {
        return `/cdn/user/${username}/${data}`
      })
      
      const usrDetail = {
        obj: `/cdn/user/${username}/${username}.obj`,
        mtl: `/cdn/user/${username}/${username}.mtl`,
        tex: texDetail,
      }
      
      const res = {
        message: `Successfully saved ${username}'s avatar to CDN Directory!`,
        data: usrDetail
      }
          
      return res;
    } catch (err) {
      throw err;
    }
  }

  async zipUserObjtoBuffer(username) {
    const zip = new jszip();
    
    try {
      const uid = await this.getUIDbyUsername(username)
      await this.uidDetail(uid);
    } catch(err) {
      // console.error(err)
      throw new RBXException("E_USERNOTFOUND");
    }
    
    try {
      const uid = await this.getUIDbyUsername(username);
      const userObj = await this.getUserObj(uid);
      
      let objData = await axios({
        url: userObj.obj,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let mtlData = await axios({
        url: userObj.mtl,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let deHash_tex =  userObj.tex['hash'].map((data, index) => {
        index++;
        return `${username}_Tex${index}.png`
      })
      
      objData = objData.data;
      mtlData = str_replace(userObj.tex['hash'], deHash_tex, mtlData.data);
      // return mtlE;
      
      const texFile = userObj.tex['url'].map(async (data, index) => {
        let texData = await axios({
          url: data,
          method: 'get',
          responseType: 'arraybuffer'
        });
        
        await zip.file(deHash_tex[index], texData.data)
      })
      
      await Promise.all(texFile)
      await zip.file(`${username}.obj`, objData)
      await zip.file(`${username}.mtl`, mtlData)
      
      const zipFile = await zip.generateAsync({ type: 'nodebuffer' });
      
      return zipFile;
    } catch (err) {
      throw err;
    }
  }
  
  // Item Section 
  async itemDetail(id) {
    const itemApi = `https://catalog.roblox.com/v1/catalog/items/${parseInt(id)}/details?itemType=Asset`;
    
    try {
      const { data } = await axios.get(itemApi);
      const thumb = await this.getItemShot(data.id);
      
      const creator = {
        "creator_id": data.creatorTargetId,
        "creator_type": data.creatorType,
        "creator_name": data.creatorName
      }
            
      const res = {
        "id": data.id,
        "imageUrl": thumb,
        "item_name": data.name,
        "item_about": data.description,
        "price": data.price,
        "creator": creator
      }
      
      return res;
    } catch(err) {
      throw new RBXException("E_ITEMNOTFOUND");
    }
  }
  
  async getItemShot(id) {
    const batchApi = `https://thumbnails.roblox.com/v1/batch`;
    const bodyBatch = [{
      "requestId": `${parseInt(id)}::Asset:420x420:webp:regular`,
      "type": "Asset",
      "targetId": parseInt(id),
      "token": "",
      "format": "webp",
      "size": "420x420"
    }];
    
    try {
      const { data } = await axios.post(batchApi, bodyBatch);
      
      return data["data"][0]["imageUrl"];
    } catch(err) {
      throw err;
    }
  }
  
  async getItemObj(id) {
    const batchApi = `https://thumbnails.roblox.com/v1/assets-thumbnail-3d?assetId=${parseInt(id)}`;
    
    try {
      const batchRes = await axios.get(batchApi);
      const { data } = await axios.get(batchRes.data['imageUrl']);
      
      const tex = data['textures'].map((e) => {
        return getHashUrl(e);
      });
      
      const texArr = {
        hash: data['textures'],
        url: tex
      };
      
      const res = {
        obj: getHashUrl(data.obj),
        mtl: getHashUrl(data.mtl),
        tex: texArr
      };
      
      return res;
    } catch(err) {
      throw err;
    }
  }
  
  async saveItemObj(id) {
    const file = parseInt(id);
    const dirFile = this.dir;
    
    try {
      await this.itemDetail(file);
    } catch(err) {
      // console.error(err)
      throw new RBXException("E_ITEMNOTFOUND");
    }
    
    try {
      await fs.stat(`${dirFile}/item/${file}`)
    } catch(err) {
      await exec(`cd ${dirFile}/item/ && mkdir ${file}`)
    }
    
    try {
      const itemObj = await this.getItemObj(file);
      
      let objData = await axios({
        url: itemObj.obj,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let mtlData = await axios({
        url: itemObj.mtl,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let deHash_tex =  itemObj.tex['hash'].map((data, index) => {
        index++;
        return `${file}_Tex${index}.png`
      })
      
      objData = objData.data;
      mtlData = str_replace(itemObj.tex['hash'], deHash_tex, mtlData.data);
      // return mtlE;
      
      const texFile = itemObj.tex['url'].map(async (data, index) => {
        let texData = await axios({
          url: data,
          method: 'get',
          responseType: 'arraybuffer'
        });
        
        await fs.writeFile(`${dirFile}/item/${file}/${deHash_tex[index]}`, Buffer.from(texData.data));
      })
      
      await Promise.all(texFile)
      await fs.writeFile(`${dirFile}/item/${file}/${file}.obj`, objData)
      await fs.writeFile(`${dirFile}/item/${file}/${file}.mtl`, mtlData)
      
      const texDetail = deHash_tex.map((data) => {
        return `/cdn/item/${file}/${data}`
      })
      
      const itemDetail = {
        obj: `/cdn/item/${file}/${file}.obj`,
        mtl: `/cdn/item/${file}/${file}.mtl`,
        tex: texDetail,
      }
      
      const res = {
        message: `Successfully saved ${file} asset to CDN Directory!`,
        data: itemDetail
      }
          
      return res;
    } catch (err) {
      throw err;
    }
  }
  
  async zipItemObjtoBuffer(id) {
    const file = parseInt(id);
    const dirFile = this.dir;
    const zip = new jszip();
    
    try {
      await this.itemDetail(file);
    } catch(err) {
      // console.error(err)
      throw new RBXException("E_ITEMNOTFOUND");
    }
    
    try {
      const itemObj = await this.getItemObj(file);
      
      let objData = await axios({
        url: itemObj.obj,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let mtlData = await axios({
        url: itemObj.mtl,
        method: 'get',
        // responseType: 'ArrayBuffer'
      })
      
      let deHash_tex =  itemObj.tex['hash'].map((data, index) => {
        index++;
        return `${file}_Tex${index}.png`
      })
      
      objData = objData.data;
      mtlData = str_replace(itemObj.tex['hash'], deHash_tex, mtlData.data);
      // return mtlE;
      
      const texFile = itemObj.tex['url'].map(async (data, index) => {
        let texData = await axios({
          url: data,
          method: 'get',
          responseType: 'arraybuffer'
        });
        
        await zip.file(deHash_tex[index], texData.data)
      })
      
      await Promise.all(texFile)
      await zip.file(`${file}.obj`, objData)
      await zip.file(`${file}.mtl`, mtlData)
      
      const zipFile = await zip.generateAsync({ type: 'nodebuffer' });
      
      return zipFile;
    } catch (err) {
      throw err;
    }
  }
  
  // Global
  async clearCDN() {
    try {
      await exec(`cd ${this.dir} && cd user && rm -rf * && cd ../item && rm -rf *`);
      
      const res = {
        message: "Successfully clearing cdn storage!"
      }
      
      return res;
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = RBX;