const AV = require('../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../utils/av-live-query-weapp-min');
let app = getApp();

/**
 * 生成年月日8位数字的时间
 */
function get_full_time() {
    let d = new Date();
    return String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
}

function get_userinfo(){
    if (Boolean(app.globalData.userInfo)) {
        return app.globalData.userInfo;
    } else {
        app.userInfoReadyCallback = u => {
        return u;
        };
    }
}

/**
 * 生成时间戳
 */
function get_timestamp() {
    let d = new Date();
    return d.getTime();
}

/**
 * 
 * @param {*} appid 小程序id 
 * @param {*} path 小程序路径
 * @param {*} data 携带的参数
 * appId: 'wx8fc9502b8f83f501',
     path: 'pages/landing/landing',
 */
function nav_to_program(appid, path,data) {
    console.log(appid, path, data);
    wx.navigateToMiniProgram({
        appId: appid,
        path: path,
        extraData: {
            data: data
        },
        envVersion: 'develop',
        success(res) {
            // 打开成功
            console.log(res);
        }
    });
}


/**
 * 
 * 获取用户的手机号码
 */
function getPhoneNumber(e) {
    console.log(app.globalData.userInfo.objectid);
    if (app.globalData.userInfo.objectid) {
      const paramsJson = {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: app.globalData.userInfo.session_key,
          openid: app.globalData.userInfo.objectid
      };
      console.log(paramsJson);
      return AV.Cloud.run('getPhoneNumber', paramsJson).then(function (data) {
          console.log('云函数回应' + data.phoneNumber);
          return data.phoneNumber;
      }).catch(console.error);
    }else{
        //如果没有获取到用户objectid的流程
        console.log('还没有拿到用户的objectid');
    }
  }
//////////////////////////////////////////////////////////////////////
/**
 * 以下存放，客户端与业务无关代码
 */
//弹出模态弹窗
function showModal(c, t, fun) {
    if (!t)
        t = '提示';
    wx.showModal({
        title: t,
        content: c,
        showCancel: false,
        success: fun
    })
}

//弹出模态弹窗
function showToast(c) {
    wx.showToast({
        title: c,
        icon: 'none',
        duration: 2000
    })
}


//弹出模态弹窗
function showLoading(time) {
    if (!time)
        time = 2000;
    wx.showLoading({
        title: '加载中',
        mask: true
    });
    setTimeout(function () {
      wx.hideLoading()
    }, time);
}

//弹出模态弹窗
function hideLoading(c) {
    wx.hideLoading();
}






/**
 * 请求模板消息发放资格
 */
function request_subscribe_message(tmpids) {
    console.log(tmpids);
    wx.requestSubscribeMessage({
        tmplIds: tmpids,
        success(res) {
        },
        fail(res){
            console.log(res);
        }
    });
}

/**
 * wx.switchTab()
 */
function switchTab(url) {
    wx.switchTab({
        url: url
    });
}

/**
 * wx.navigateTo()
 */
function navigateTo(url) {
    wx.navigateTo({
        url: url
    });
}



module.exports.showModal = showModal;
module.exports.showToast = showToast;
module.exports.get_full_time = get_full_time;// 获取年月日消息
module.exports.get_timestamp = get_timestamp; // 请求时间戳
module.exports.request_subscribe_message = request_subscribe_message;// 请求发放模板消息
module.exports.nav_to_program = nav_to_program;//跳转小程序
module.exports.getPhoneNumber = getPhoneNumber; //请求电话号码

module.exports.get_userinfo = get_userinfo; //请求电话号码

module.exports.switchTab = switchTab; //wx.switchTab()
module.exports.navigateTo = navigateTo; //wx.navigateTo()

module.exports.showLoading = showLoading; //wx.switchTab()
module.exports.hideLoading = hideLoading; //wx.navigateTo()
