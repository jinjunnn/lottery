const {
  User
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();


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
    let that = this;
    let results = null;
    let donote = (period, code) => {
      console.log(results);
      if (!results.hasOwnProperty(period)) {
        return [-1, null];
      } else if (results[period] != code) {
        console.log(results[period]);
        let p = results[period];
        return [0, p];
      } else {
        console.log(results[period]);
        let p = results[period];
        return [1, p];
      }
    };
    let query_results = (records) => {
      let paramsJson = {
        key: 'lottery_result',
      };
      AV.Cloud.run('getHash', paramsJson).then(x => {
        results = x;
        wx.hideLoading();
        that.setData({
          records: records.map((item, index) => {
            if (index % 8 == 0) {
              item.load_add = true;
            }
            let result = donote(item.period, item.code);
            item.result = result[0];
            item.mcode = result[1];
            return item;
          })
        });
      });
    };
    let query_records = () => {
      let paramsJson = {
        key: 'record_20_' + app.globalData.userInfo.uid, // 'record_20_' + app.globalData.userInfo.uid,
        begin: 0,
        end: 500,
      };
      console.log(paramsJson);
      AV.Cloud.run('get_list_details', paramsJson).then(records => {
        query_results(records);
      });
    };
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    query_records();

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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})