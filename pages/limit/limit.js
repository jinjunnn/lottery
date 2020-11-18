//限定助力活动
const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
let key_ = 'record_limit_';
let list_key = 'list_limit_lottery';
let index = 0;
let lottery_list = [];

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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    that.query_lottery(list_key, index * 12, index * 12 + 11);
    if (Boolean(app.globalData.userInfo)) {
        that.query_list();
    } else {
      app.userInfoReadyCallback = u => {
        that.query_list();
      };
    }

  },

  query_lottery(key, begin, end) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: begin,
      end: end,
    };
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      index++;
      let data = result.map((item , i)=> {
        item.times = Number(item.price) * 2;
        if ((i + 1) % 12 == 0) {
          item.ad_display = true;
        }
        return item;
      });
      lottery_list = lottery_list.concat(data);
      that.setData({
        lottery_list: lottery_list,
      });
    });
  },

  bind_nav(e) {
    console.log(e.currentTarget.dataset)
    if (e.currentTarget.dataset.ended == 1) {
      common.showToast('今日该商品活动已经结束。');
    } else {
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      });
    }

  },
  query_list(){
      let that = this;
      let today = common.get_full_time();
      let paramsJson = {
        key: key_ + app.globalData.userInfo.uid, // 'record_19_' + app.globalData.userInfo.uid,
        begin: 0,
        end: 1,
        product: 'limit_lottery'
      };
      AV.Cloud.run('query_limit_lottery_records', paramsJson).then(data => {
        console.log(data);
        that.setData({
          data:data,
          today:today,
        });
      });
  },

  bindnavto(){
      wx.navigateTo({
        url: '/pages/user/record/limit',
      });
  },

  //领取奖品  
  bind_click(e) {
    console.log(e.currentTarget.dataset.msg);
    let paramsJson = {
      key: e.currentTarget.dataset.msg.key, //app.globalData.userInfo.uid, // 'record_19_' + app.globalData.userInfo.uid,
      uid: app.globalData.userInfo.uid,
      code: app.globalData.userInfo.code,
      gid: e.currentTarget.dataset.msg.gid,
    };
    AV.Cloud.run('get_limit_lottery_award', paramsJson).then(data => {
      console.log(data);
      if (data == 1) {
          common.showToast('领取成功');
      } else if (data == 0) {
          common.showToast('已领取过,请查看领取记录查看领取进度。');
      }else {
          common.showToast('领取出错请联系客服');
      }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    index = 0;
    lottery_list = [];
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    index = 0;
    lottery_list = [];
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
    that.query_lottery(list_key, index * 12, index * 12 + 11);
  },

  onShareAppMessage: function (e) {
    wx.showShareMenu({
      withShareTicket: true
    });
    console.log(e.target.dataset.times)
    let that = this;
    let title = '@你，限时今日！助力' + e.target.dataset.times + '次必获奖励。快来帮帮我';
    let path = '/pages/limit/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + e.target.dataset.gid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: e.target.dataset.image
    }
  },
  onShareTimeline(e) {
    wx.showShareMenu({
      withShareTicket: true
    });
    let that = this;
    let title = '@你，限时今日！助力' + e.target.dataset.times + '次必获奖励。快来帮帮我';
    let path = '/pages/limit/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + e.target.dataset.gid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: e.target.dataset.image,
    }
  },
})