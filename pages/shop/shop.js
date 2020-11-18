/**
 * 快闪店
 */
const AV = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();
let index = 0;
let key = 'sugar_flash_shop';

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

    /**
   * 查询求购卡片的信息
   */
  query_list(key, begin, end) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: begin,
      end: end,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      index++;
      let r =result;
      that.setData({list:r});
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  navigate(e) {
    let {key,post=0,title} = e.currentTarget.dataset;
    let data = {}
    data.title =  title;
    data.post =  post;
    data.key =  key;
    let path = '/pages/flash/item/item';
    common.nav_to_program('wx8fc9502b8f83f501', path,data);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    that.query_list(key, index * 20, index * 20 + 19);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    index = 0;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    index = 0;
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
      that.query_list(key, index * 20, index * 20 + 19);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})