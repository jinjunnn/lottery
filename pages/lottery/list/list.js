const AV = require('../../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();

let list_id;
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
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.shop_name,
    });
    list_id = options.list_id;
    let that = this;
    that.query_list('goods_list_' + list_id, index * 20, index * 20 + 19);
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
   * 查询商铺的所有信息
   * 参数是listing 的id
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
      console.log(result);
      sell_list = sell_list.concat(result);
      console.log(sell_list);
      that.setData({
        sell_list: sell_list.map((item,index) =>{
          if((index+1)%10==0){
            item.ad_display = true;
          }
          return item;
        }),
      });
    });
  },

  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },

  bind_nav_detail(e){
    wx.navigateTo({
      url: './detail/detail?key=' + e.currentTarget.dataset.key,
    });
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
    index = 0;
    sell_list = [];
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
      that.query_list('goods_list_' + list_id, index * 20, index * 20 + 19);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})