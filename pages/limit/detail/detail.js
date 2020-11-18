/**
 * 限定次数抽奖
 */

const AV = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let goodid = null; //
let videoAd = null; // 在页面中定义激励视频广告
let sharer = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModalStatus: 0, //0不显示弹窗
    backgroundColor: "",
    icon_xiaochengxu01: image.xiaochengxu01,
    icon_xiaochengxu02: image.xiaochengxu02,
    icon_wechat: image.wechat,
    icon_wechat_add: image.wechat_add,
    authorize: false,
    share_is_user:false,
    lottery_amount: 0,
    had_lotteryed: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    goodid = options.id;

    if (Boolean(options.sharer)) {
      sharer = options.sharer;
    }
    //查询 限定抽奖信息
    if (Boolean(app.globalData.userInfo)) {
      that.query_limit_lottery(app.globalData.userInfo.uid,sharer,goodid);
    } else {
      app.userInfoReadyCallback = u => {
        that.query_limit_lottery(u.uid, sharer, goodid);
      };
    }
    //激励视频广告
    that.pre_onload(sharer);
    that.query_goods(goodid);
  },

  pre_onload(sid){
    let that = this;
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-d92d8a903b0bbd97'
      });
      videoAd.onLoad(() => {
        that.setData({
          adUnitId: true,
          sharer: sid,
        });
      });
      videoAd.onError((err) => {
        that.setData({
          adUnitId: false,
          sharer: sid,
        });
      });
      videoAd.onClose((res) => {
        if (res.isEnded) {
          that.attend_lottery();
        } else {
          common.showToast('亲,观看完整视频才可以参与抽奖');
        }
      });
    }
  },

  /**
   * 查询限制抽奖
   */
  query_limit_lottery(uid,sid,gid) {
    console.log(uid,sid,gid);
    let that = this;
    let query = () => {
          let paramsJson = {
            uid: uid,
            sid: sid,
            gid: gid,
          };
          AV.Cloud.run('query_limit_lottory', paramsJson).then(data => {
            console.log(data);
            that.query_list(data);
          });
    };
    let query_my_donate_list = (data) => {
              let that = this;
              common.showLoading(3000);
              let paramsJson = {
                users: data,
              };
              AV.Cloud.run('query_users_infors', paramsJson).then((data) => {
                common.hideLoading();
                that.setData({
                  users: data,
                  lottery_amount:data.length,
                });
              });
    }
    let query_my_list = () => {
          let key = 'limit_lottery_' + common.get_full_time() + '_' + uid + '_' + gid;
          let paramsJson = {
            key: key,
            begin: 0,
            end: -1,
          };
          console.log(paramsJson);
          AV.Cloud.run('query_list', paramsJson).then(data => {
            console.log(data);
            if(data[0]){
              console.log('存在');
              query_my_donate_list(data);
            }
            else{
              console.log('不存在');
            }
          });
    }
    if(!sid || sid==uid){
      //  打开分享页面的人 是自己  或者， 没有分享者，用户自己打开页面。
      query_my_list();
      that.setData({
        share_is_user: true,
      });
    }else {
      // 用户打开别人分享的页面
      query();
    }
  },

  /**
   * 查询 用户今日的抽奖计划。
   * 1、本群中是否抽过奖，
   * 2、今日是否抽过超过5次奖。
   */
  bind_click() {
    let that = this;
    let show_ad = () => {
      if (videoAd) {
        videoAd.show().catch(() => {
          console.log('没有广告');
          common.showToast('暂时没有适合投放的广告');
          videoAd.load()
            .then(() => videoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败');
            });
        });
      }
    };
    let query = (uid,sid,gid) => {
      let paramsJson = {
        uid: uid,
        sid: sid,
        gid: gid,
      };
      AV.Cloud.run('query_limit_lottory', paramsJson).then(data => {
        console.log(data.code);
          if (data.code == -1) {
          common.showToast('限定活动已结束');
        } else if (data.code == -2) {
          common.showToast('您的好友已完成助力');
        } else if (data.code == -3) {
          common.showToast('您已助力过好友');
        } else if (data.code == -5) {
          common.showToast('您今日已达到助力上限');
        } else if (data.code == 0) {
          show_ad();
        }
        that.query_list(data);
      });
    };
    let get_uid = () => {
      if (Boolean(app.globalData.userInfo)) {
          query(app.globalData.userInfo.uid,sharer,goodid);
      } else {
        app.userInfoReadyCallback = u => {
          query(u.uid, sharer, goodid);
        };
      }
    };
    let request_subscribe_message = (tmpids) => {
      wx.requestSubscribeMessage({
        tmplIds: tmpids,
        success(res) {
          console.log(res);
          get_uid();
        },
        fail(res) {
          common.showToast('取消收取订阅消息您将无法获得中奖信息');
          get_uid();
        }
      });
    };
    request_subscribe_message(['qPdhctZF31bJcXr4gqLrFbsVhXXFYBY3MCFjxZ5H4fQ', 'k2_YJUliPs0h1SyNa2u1IUP4hJWE2pJkv8S0t1Uyx7k'])
  },

  /**
   * 用户参与抽奖
   * 1、生成抽奖记录，
   * 2、将今日抽奖 记录增加
   * 3、开奖
   */
  attend_lottery() {
    let that = this;
    let get_group_id = () => {
          let paramsJson = {
            uid: app.globalData.userInfo.uid,
            sid: sharer,
            gid: goodid,
            code: app.globalData.userInfo.code,
          };
          AV.Cloud.run('limit_lottery', paramsJson).then(data => {
            if (data.code == -1) {
              common.showToast('限定活动已结束');
            } else if (data.code == -2) {
              common.showToast('您的好友已完成助力');
            } else if (data.code == -3) {
              common.showToast('您已助力过好友');
            } else if (data.code == -5) {
              common.showToast('您今日已达到助力上限');
            } else if (data.code == 0) {
              common.showToast('您已完成助力');
            }
            console.log('重新查询',app.globalData.userInfo.uid,sharer,goodid);
              that.query_limit_lottery(app.globalData.userInfo.uid,sharer,goodid);
          });
    };
    get_group_id();
  },

  //查询 抽奖名单
  query_list(dt){
    let that = this;
    common.showLoading(3000);
    let paramsJson = {
      users: dt.data,
    };
    console.log('我是dt',dt)
    AV.Cloud.run('query_users_infors', paramsJson).then((data) => {
      common.hideLoading();
      that.setData({
        users: data,
        data:dt,
        lottery_amount:data.length,
      });
    });
  },

  /**
   * 查询商品信息
   */
  query_goods(id) {
    let that = this;
    common.showLoading(3000);
    let paramsJson = {
      key: 'item_' + id
    };
    AV.Cloud.run('getHash', paramsJson).then((data) => {
      wx.setNavigationBarTitle({
        title: data.name
      });
      let good = data;
      good.ll_times = Number(good.ll_times);
      if (data.hasOwnProperty('images')) {
        data.images = JSON.parse(data.images);
      }
      if (data.hasOwnProperty('seller')) {
        data.seller = JSON.parse(data.seller);
      }
      that.setData({
        good: good,
      });
      common.hideLoading();
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
    let that = this;
    that.setData({
      ticket: wx.getEnterOptionsSync().shareTicket,
    });
    that.query_authorize();
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
    console.log('卸载页面。')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    });
    let that = this;
    let title = '@你，限时今日！助力' + that.data.good.ll_times + '次必获奖励。快来帮帮我';
    let path = '/pages/limit/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + goodid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.good.image
    }
  },
  onShareTimeline() {
    wx.showShareMenu({
      withShareTicket: true
    });
    let that = this;
    let title = '@你，限时今日！助力' + that.data.good.ll_times + '次必获奖励。快来帮帮我';
    let path = '/pages/limit/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + goodid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.good.image,
    }
  },

  //用户点击广告  赠送奖励
  bind_view_ad_get_rewrad() {
    let that = this;
    that.hideModal();
    // 用户点击抽奖后
    let show_ad = () => {
      if (videoAd) {
        videoAd.show().catch(() => {
          common.showToast('暂时没有适合投放的广告');
          videoAd.load()
            .then(() => videoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败');
            });
        });
      }
    };
    // 查询用户的抽奖状态，如果超过10次提示今日不能够抽奖
    let query_lottery = (uid) => {
      let paramsJson = {
        key: 'l1_' + uid + '_' + common.get_full_time() + '*', //商品名称
      };
      AV.Cloud.run('query_keys_amount', paramsJson).then((data) => {
        if (data < 10) {
          show_ad();
        } else {
          common.showToast('每日最多可以抽奖10次，请明日再来。')
        }
      });
    };
    // 查询用户的uid
    let get_uid = () => {
      if (Boolean(app.globalData.userInfo)) {
        query_lottery(app.globalData.userInfo.uid);
      } else {
        app.userInfoReadyCallback = u => {
          query_lottery(u.uid);
        };
      }
    };
    // 订阅消息
    let request_subscribe_message = (tmpids) => {
      wx.requestSubscribeMessage({
        tmplIds: tmpids,
        success(res) {
          get_uid();
        },
        fail(res) {
          common.showToast('取消收取订阅消息您将无法获得中奖信息')
          get_uid();
        }
      });
    }
    request_subscribe_message(['qPdhctZF31bJcXr4gqLrFbsVhXXFYBY3MCFjxZ5H4fQ', 'k2_YJUliPs0h1SyNa2u1IUP4hJWE2pJkv8S0t1Uyx7k'])
  },

  //出现和隐藏弹出框
  showModal: function (idx, color) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    console.log(animation.export());
    this.setData({
      animationData: animation.export(),
      showModalStatus: idx,
      backgroundColor: color,
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },

  // 隐藏遮罩层
  hideModal: function () {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    this.setData({
      animationData: animation.export(),
      ackgroundColor: "",
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export(),
        showModalStatus: 0,
        backgroundColor: "",
      });
    }.bind(this), 200);
  },


  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },

  // 点击授权  授权用户的头像信息。
  authorize(e) {
    console.log(e.detail.userInfo);
    let that = this;
    let load_info = (user) => {
      const paramsJson = {
        userinfo: e.detail.userInfo,
        uid: user.uid,
      };
      console.log(paramsJson);
      AV.Cloud.run('set_user_info', paramsJson).then(function (data) {
        console.log(data);
        that.setData({
          authorize: true,
        })
        wx.hideLoading()
        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 2000
        })
      }).catch(console.error);
    };
    let pre_get_userinfo = () => {
      wx.showLoading({
        title: '加载中',
      });
      if (Boolean(app.globalData.userInfo)) {
        load_info(app.globalData.userInfo);
      } else {
        app.userInfoReadyCallback = u => {
          load_info(u);
        };
      }
    }
    if (e.detail.userInfo) {
      pre_get_userinfo();
    } else {
      common.showToast('群抽奖需要授权头像用以展示。')
    }
  },

  //查询 用户是否授权
  query_authorize() {
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            authorize: false,
          });
        } else {
          that.setData({
            authorize: true,
          });
        }
      }
    });
  },

  //点击进入小程序
  bind_nav_mini_program(e) {
    console.log(e);
    let {
      appid,
      path,
      data
    } = e.currentTarget.dataset;
    common.nav_to_program(appid, path, data);
  },

})
