const AV = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();

let list = 'list_handsel';
let index = 0;
let my_list = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      let that = this;
      if (Boolean(app.globalData.userInfo)) {
        that.query_my_handsel_list(app.globalData.userInfo.uid, index * 8, index * 8 + 7);
      } else {
        app.userInfoReadyCallback = u => {
          that.query_my_handsel_list(u.uid, index * 8, index * 8 + 7);
        };
      }
  },

  query_my_handsel_list(uid,begin,end) {
    let that = this;
    let is_expired = (expired) => {
      console.log(Number(expired));
      let now = common.get_timestamp();
      console.log(now);
      if (Number(expired) > now){
        return false;
      }else{
        return true;
      }
    };

    let query_goods_info = (item) => {
      let paramsJson = {
        key: 'item_' + item.goodid,
      };
      console.log(paramsJson);
      AV.Cloud.run('getHash', paramsJson).then((result) => {
        let obj = {}
        console.log(result);
        let my_handsel = item;
        console.log(item);
        let left = Number(item.total) - Number(item.paid);
        console.log(left);
        my_handsel.left_times = parseInt(left / 50);
        my_handsel.paid = Number(item.paid);
        my_handsel.total = Number(item.total);
        console.log(my_handsel);
        obj.goods_info = result;
        obj.my_handsel = my_handsel;
        obj.expired = is_expired(my_handsel.expired);
        console.log(obj);
        my_list.push(obj);
        that.setData({
          list: my_list,
        });
      });
    };

    const paramsJson = {
      key: 'wish_list_' + uid,
      begin: begin,
      end: end,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      index++;
      result.map(item => {
          return query_goods_info(item);
      });
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    index = 0;
    my_list = [];
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    index = 0;
    my_list = [];
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      let that = this;
      that.query_my_handsel_list(app.globalData.userInfo.uid, index * 8, index * 8 + 7);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})