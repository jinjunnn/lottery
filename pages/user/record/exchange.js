const {
  User
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();
let interstitialAd = null;

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
    let query_records = () => {
      const query = new AV.Query('Handsel');
      query.equalTo('user', app.globalData.userInfo.uid);
      query.find().then((results) => {
          that.setData({
            list: results,
          });
      });
    };
    query_records();
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-d1c2184c3c23f26d'
      })
      interstitialAd.onLoad(() => {
        // 在适合的场景显示插屏广告
        if (interstitialAd) {
          setTimeout(() => {
            interstitialAd.show().catch((err) => {
              console.error(err)
            })
          }, 2000);

        }
      })
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }
  },

  bind_nav(e) {
    console.log(e.currentTarget.dataset.id)
      wx.setClipboardData({
        data: e.currentTarget.dataset.id,
        success(res) {
          wx.getClipboardData({
            success(res) {
              console.log(res) // data
            }
          })
        }
      })
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