//砍价

const AV = require('../../utils/av-live-query-weapp-min');
const {
  User,
  Query,
  Cloud
} = require('../../utils/av-live-query-weapp-min');
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
      expired: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.hasOwnProperty('key')){
      list = options.key;
      wx.setNavigationBarTitle({
        title: options.name,
      });
    }else{
      wx.setNavigationBarTitle({
        title: '精选好物0元砍',
      });
    }


    let that = this;
    that.query_list(list, index * 18, index * 18 + 17);
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
        that.query_my_handsel_list(app.globalData.userInfo.uid);
      } else {
        app.userInfoReadyCallback = u => {
          that.query_my_handsel_list(u.uid);
        };
      }
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
      sell_list = sell_list.concat(result);
      that.setData({
        sell_list: sell_list.map((item, index) => {
          item.times = item.price * 2 + 30;
          if ((index + 1) % 12 == 0) {
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
  
  query_my_handsel_list(uid){
    let that = this;
    let query_goods_info = (item) => {
        let paramsJson = {
              key: 'item_' + item.goodid,
        };
        console.log(paramsJson);
        AV.Cloud.run('getHash', paramsJson).then((result) => {
            let my_handsel = item;
            let left = Number(item.total) - Number(item.paid);
            my_handsel.left_times = parseInt(left / 50);
            my_handsel.paid = Number(item.paid);
            my_handsel.total = Number(item.total);
            that.getLeftTime(item.expired);
            that.setData({
              my_list: my_handsel,
              goods_info: result,
            });
        });
    };

    const paramsJson = {
      key: 'wish_list_' + uid,
      begin: 0,
      end: 2,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
            query_goods_info(result[0]);
        });
  },

  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },

  bind_nav_detail(e) {
    wx.navigateTo({
      url: './detail/detail?key=' + e.currentTarget.dataset.key,
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

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
    that.query_list(list, index * 18, index * 18 + 17);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    let path = '/pages/handsel/handsel?sharer=' + app.globalData.userInfo.uid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: '零元砍',
      path: path,
      imageUrl: that.data.sell_list[0].image,
    };
  },
  getLeftTime(deadline) {
    var totalSecond = (Number(deadline) - Date.parse(new Date())) / 1000;
    totalSecond = parseInt(totalSecond);
    console.log(totalSecond);
    var interval = setInterval(function () {
      // 秒数
      var second = totalSecond;
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      this.setData({
        countDownDay: dayStr,
        countDownHour: hrStr,
        countDownMinute: minStr,
        countDownSecond: secStr,
        expired: false,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        this.setData({
          countDownDay: '00',
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
          expired: true,
        });
      }
    }.bind(this), 1000);
  },
})