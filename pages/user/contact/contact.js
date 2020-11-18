const {
  User
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();
let qrcode = '';

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
    that.get_src();
  },

  get_src(){
    let that = this;
      that.setData({
        wechat_group_title: app.globalData.settings.wechat_group_title,
        wechat_group_image: app.globalData.settings.wechat_group_image,
        wechat_group_ad_content: app.globalData.settings.wechat_group_ad_content,
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