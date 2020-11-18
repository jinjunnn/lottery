const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
let app = getApp();
let index = 0; //scan 游标的起始位置
let list = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    arror_icon: image.arror_icon,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.query_first_list();
      that.query_list(index);
      that.query_settings();
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
  query_list(i) {
    let that = this;
    const paramsJson = {
      page_index: i,
    };
    AV.Cloud.run('query_listings_and_goods', paramsJson).then(results => {
      results.map((listing) => {
        listing.goods.map(good => {
          good.images = good.images.split(",");
        });
      });
      index++; //用于迭代数组
      list = list.concat(results);
      that.setData({
        list: list,
      });
    });
  },

  bind_nav_mini_program(e) {
    console.log(e);
    let {appid,path,data= null} = e.currentTarget.dataset;
    common.nav_to_program(appid,path,data);
  },

  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },

  bind_switch_tab(e){
    wx.switchTab({
      url: e.currentTarget.dataset.url,
    });
  },

  query_first_list(){
      let that = this;
      const paramsJson = {
        key: 'list_free_lottery',
        begin: 0,
        end: 3,
      };
      console.log(paramsJson);
      AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
        that.setData({
          sell_list: result,
        });
      });
  },

  query_settings() {
      let that = this;
      console.log('进入query_settings流程');
      if (Boolean(app.globalData.settings)) {
        console.log('设置信息');
        that.setData({
          settings: app.globalData.settings,
        });
      } else {
        app.appSettingsCallback = s => {
          console.log('进入callback函数');
          console.log(s);
          that.setData({
            settings: s,
          });
        };
      }
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
    index = 0; //scan 游标的起始位置
    list = [];
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
      console.log('触底上拉');
      let that = this;
      that.query_list(index);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    let {lottery_page_share_title,lottery_page_share_image} =that.data.settings;
    let path = '/pages/lottery/lottery?sharer=' + app.globalData.userInfo.uid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: '视频抽奖',
      path: path,
      imageUrl: lottery_page_share_image,
    };
  }
})