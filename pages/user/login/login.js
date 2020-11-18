const {User} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {

  },
  onLoad: function () {

  },
  /**
   * 获取用户信息，并存储到redis中。
   * @param {} e 
   */
  onGotUserInfo(e) {
    wx.showLoading({title: '加载中',});
    let load_info = (user) => {
        const paramsJson = {
          userinfo: e.detail.userInfo,
          uid: user.uid,
        };
        console.log(paramsJson);
        AV.Cloud.run('set_user_info', paramsJson).then(function (data) {
          console.log(data);
          wx.navigateBack({
            delta: 1
          });
        }).catch(console.error);
    };
    if (Boolean(app.globalData.userInfo)) {
      load_info(app.globalData.userInfo);
    } else {
      app.userInfoReadyCallback = u => {
        load_info(u);
      };
    }
  },
});