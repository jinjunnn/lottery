const AV = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();
let list = 'list_handsel';
let index = 0;
let sell_list = [];
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
    that.query_handsel('list_handsel');
    that.query_wish('list_wish_lottery');
    that.query_free('list_free_lottery');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  /**
   * 查询商铺的所有信息
   * 参数是listing 的id
   */
  query_handsel(key) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: 0,
      end: 11,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((list) => {
      that.setData({
        handsel: list
      });
    });
  },
  /**
   * 查询商铺的所有信息
   * 参数是listing 的id
   */
  query_wish(key) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: 0,
      end: 11,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((list) => {
      that.setData({
        wish: list
      });
    });
  },
  /**
   * 查询商铺的所有信息
   * 参数是listing 的id
   */
  query_free(key) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: 0,
      end: 11,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((list) => {
      that.setData({
        free: list
      });
    });
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