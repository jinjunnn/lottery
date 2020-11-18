//群抽奖
const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
let key_ = 'record_group_';
let list_key = 'list_handsel';
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
      let data = result.map((item , i) =>{
        item.times = Number(item.price)*2;
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
    if (e.currentTarget.dataset.ended==1){
        common.showToast('今日该商品活动已经结束。');
    }else{
        wx.navigateTo({
          url: e.currentTarget.dataset.url,
        });
    }

  },
  query_list() {
    let that = this;
    let today = common.get_full_time();
    let paramsJson = {
      key: key_ + app.globalData.userInfo.uid, // 'record_19_' + app.globalData.userInfo.uid,
      begin: 0,
      end: 39,
      product:'group_lottery'
    };
    AV.Cloud.run('query_limit_lottery_records', paramsJson).then(data => {
      that.setData({
        data: data.map(item => {
          let winner = item.lottery_info.filter(i => {
            return i.get == true;
          });
          item.winner = winner[0];
          return item;
        }),
        today:today,
        uid: app.globalData.userInfo.uid,
      });
    });
  },

  bind_click() {
    wx.showToast({
      title: '受腾讯规则限制，群抽奖仅可以进群查看中奖信息。',
      icon: 'none',
      duration: 4000
    });
  },

  bind_get_award(e) {
    console.log(e.currentTarget.dataset.msg);
    let paramsJson = {
      key: e.currentTarget.dataset.msg.key, //app.globalData.userInfo.uid, // 'record_19_' + app.globalData.userInfo.uid,
      uid: app.globalData.userInfo.uid,
      code: app.globalData.userInfo.code,
      gid: e.currentTarget.dataset.msg.gid,
    };
    AV.Cloud.run('get_group_lottery_award', paramsJson).then(data => {
      console.log(data);
      if (data == -1) {
        common.showToast('未完成');
      } else if (data == 1) {
        common.showToast('领取成功');
      } else if (data == 0) {
        common.showToast('已领取过,请查看领取记录查看领取进度。');
      } else {
        common.showToast('领取出错请联系客服');
      }
    });
  },
  bindnavto(){
      wx.navigateTo({
        url: '/pages/user/record/group',
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

  /**
   * 用户点击右上角分享
   */
//   onShareAppMessage: function () {
//     let that = this;
//     let sharer = app.globalData.userInfo.uid;
//     console.log(sharer);
//     let ticket = common.get_timestamp();
//     console.log(ticket);
//     let {
//       wish_page_share_title = null, wish_page_share_image = null
//     } = that.data.settings;
//     let path = '/pages/share/share?sharer=' + sharer + '&ticket=' + ticket; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
//     console.log(path);

//     return {
//       title: wish_page_share_title,
//       path: path,
//       imageUrl: wish_page_share_image,
//     };
//   },
//   onShareTimeline() {
//     let that = this;
//     let sharer = app.globalData.userInfo.uid;
//     console.log(sharer);
//     let ticket = common.get_timestamp();
//     console.log(ticket);
//     let {
//       wish_page_share_title = null, wish_page_share_image = null
//     } = that.data.settings;
//     let path = '/pages/wish/wish?sharer=' + sharer; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
//     console.log(path);

//     return {
//       title: wish_page_share_title,
//       path: path,
//       imageUrl: wish_page_share_image,
//     };
//   }
})