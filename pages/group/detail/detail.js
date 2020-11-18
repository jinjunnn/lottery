/**
 * 群抽奖
 * 1.用户在某个群中，分享链接，即可发起在群中的抽奖活动。
 * 2.每个用户每日在每个群中，可以参与1次群抽奖活动。
 * 3.每个用户每日在多个群中总计可以参与3次群抽奖活动。
 * 4.当抽奖次数达到商品开奖要求的次数，即可开奖。
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
    showModalStatus:0,//0不显示弹窗
    backgroundColor: "",
    icon_xiaochengxu01: image.xiaochengxu01,
    icon_xiaochengxu02: image.xiaochengxu02,
    icon_wechat: image.wechat,
    icon_wechat_add: image.wechat_add,
    ticket:null,
    winner:null,
    authorize:false,
    lottery_amount:0,
    had_lotteryed:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    goodid = options.id;
    console.log(goodid);

    if (Boolean(options.sharer)) {
      sharer = options.sharer;
    }

    //激励视频广告
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-d92d8a903b0bbd97'
      });
      videoAd.onLoad(() => {that.setData({adUnitId: true})})
      videoAd.onError((err) => {that.setData({adUnitId: false})});
      videoAd.onClose((res) => {
        if (res.isEnded) {
          that.attend_lottery();
        } else {
          common.showToast('亲,观看完整视频才可以参与抽奖');
        }
      });
    }
    
    that.query_goods(options.id);
  },

  /**
   * 查询群的信息
   */
  query_group_lottery(uid){
    let that = this;
    console.log('进入query_group_lottery流程');
    /**
     *  查询 本群 本订单的抽奖信息
     *  gid:群id
     * goodid:商品id
     */
    let get_group_lottery_info = (gid) => {
        let paramsJson = {
          key: 'gl_' + common.get_full_time() + '_' + gid + '_' + goodid
        }
        console.log(paramsJson);
        AV.Cloud.run('getSet', paramsJson).then(data => {
          if(data.length ==0){
            //没有任何信息
          }else{
            //抽奖的信息
            let msg = data.map(item => {
              return JSON.parse(item);
            });
            //抽奖的中奖人
            let winner = msg.filter(item => {
              return item.get == true;
            });
            let had_lotteryed = msg.filter(item => {
              return item.uid == app.globalData.userInfo.uid;
            });
            console.log('had_lotteryed_length=', had_lotteryed.length);
            that.setData({
              msg:msg,//抽奖的信息
              lottery_amount:data.length,//抽奖的次数
              winner: winner[0],//中奖的用户
              had_lotteryed: had_lotteryed.length,//用户是否中奖。
            });
          }
        });
    };
    /**
     * 查询groupid
     */
    let get_group_id = () => {
      if (wx.getEnterOptionsSync().shareTicket) {
        console.log('shareticket=', wx.getEnterOptionsSync().shareTicket);
        //通过shareticket获得 群id gid
        wx.getShareInfo({
          shareTicket: wx.getEnterOptionsSync().shareTicket,
          success: function (res) {
            let encryptedData = res.encryptedData;
            let iv = res.iv;
            let paramsJson = {
              uid: uid,
              encryptedData: encryptedData,
              iv: iv,
              app_name: 'lottery'
            };
            console.log(paramsJson);
            AV.Cloud.run('get_group_id', paramsJson).then(data => {
              console.log('gid=',data);
              get_group_lottery_info(data);
            });
          }
        });
      }else{
        console.log('没有shareTicket');
        that.setData({
          ticket:null,
        });
      }
    };
    get_group_id();
  },

  /**
   * 查询 用户今日的抽奖计划。
   * 1、本群中是否抽过奖，
   * 2、今日是否抽过超过5次奖。
   */
  bind_lottery(){
    let that = this;
    that.hideModal();
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
    let get_group_id = (uid) => {
      if (wx.getEnterOptionsSync().shareTicket) {
        wx.getShareInfo({
          shareTicket: wx.getEnterOptionsSync().shareTicket,
          success: function (res) {
            let encryptedData = res.encryptedData;
            let iv = res.iv;
            let paramsJson = {
              uid: uid,
              encryptedData: encryptedData,
              iv: iv,
              app_name: 'lottery',
              sharer: sharer,
              goodid: goodid,
            };
            AV.Cloud.run('query_user_group_lottery_times', paramsJson).then(data => {
              console.log(data.code);
              console.log(data.msg);
              if (data.code == 0) {
                show_ad();
              } else if (data.code == -1) {
                common.showToast('您已达到今日抽奖上限。');
              } else if (data.code == -2) {
                common.showToast('每名用户每日仅可以抽奖1次。');
              }
              that.setData({
                msg: data.msg.map(item => {
                  return JSON.parse(item);
                })
              });
            });
          }
        });
      }
    }
    let get_uid = () => {
      if (Boolean(app.globalData.userInfo)) {
        get_group_id(app.globalData.userInfo.uid);
      } else {
        app.userInfoReadyCallback = u => {
          get_group_id(u.uid);
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
          common.showToast('取消收取订阅消息您将无法获得中奖信息')
          get_uid();
        }
      });
    }
    request_subscribe_message(['qPdhctZF31bJcXr4gqLrFbsVhXXFYBY3MCFjxZ5H4fQ', 'k2_YJUliPs0h1SyNa2u1IUP4hJWE2pJkv8S0t1Uyx7k'])
  },

  /**
   * 用户参与抽奖
   * 1、生成抽奖记录，
   * 2、将今日抽奖 记录增加
   * 3、开奖
   */
  attend_lottery(){
    let that = this;
    let get_group_id = () => {
      if (wx.getEnterOptionsSync().shareTicket) {
        wx.getShareInfo({
          shareTicket: wx.getEnterOptionsSync().shareTicket,
          success: function (res) {
            let encryptedData = res.encryptedData;
            let iv = res.iv;
            let paramsJson = {
              uid: app.globalData.userInfo.uid,
              encryptedData: encryptedData,
              iv: iv,
              app_name: 'lottery',
              sharer:sharer,
              goodid:goodid,
            };
            AV.Cloud.run('group_lottery', paramsJson).then(data => {
              console.log(data.code);
              console.log(data.msg);
              if (data.code == 0) {
                common.showToast('您已完成本次抽奖');
                that.setData({
                  had_lotteryed:1,
                });
              }else if (data.code == -1){
                common.showToast('您已达到今日抽奖上限。');
              } else if (data.code == -2){
                common.showToast('每名用户每日仅可以抽奖1次。');
              }
              that.setData({
                msg: data.msg.map(item => {
                  return JSON.parse(item);
                })
              });
            });
          }
        });
      }
    }
    get_group_id();
  },

  /**
   * 查询商品信息
   */
  query_goods(id) {
    let that = this;
    wx.showLoading({title: '加载中',mask: true});
    let paramsJson = {key: 'item_' + id};
    AV.Cloud.run('getHash', paramsJson).then((data) => {
      wx.setNavigationBarTitle({title: data.name});
      let good = data;
      good.gl_times = Number(good.gl_times);
      if (data.hasOwnProperty('images')) {
        data.images = JSON.parse(data.images);
      }
      if (data.hasOwnProperty('seller')) {
        data.seller = JSON.parse(data.seller);
      }
      that.setData({
        good: good,
      });
      wx.hideLoading();
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
    //查询 群抽奖的信息
    if (Boolean(app.globalData.userInfo)) {
      that.query_group_lottery(app.globalData.userInfo.uid);
    } else {
      app.userInfoReadyCallback = u => {
        that.query_group_lottery(u.uid);
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
    console.log('卸载页面。')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '群成员抽奖' + that.data.good.gl_times + '次随机选1名群成员中奖。100%中奖';
    let path = '/pages/group/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + goodid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.good.image
    }
  },
  onShareTimeline() {
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '群成员抽奖' + that.data.good.gl_times + '次随机选1名群成员中奖。100%中奖';
    let path = '/pages/group/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + goodid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.good.image,
    }
  },

  //点击抽奖
  bind_chick() {
    let that = this;
    that.hideModal();
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
    let query_lottery = (uid) => {
      let paramsJson = {
        key: 'l1_' + uid + '_' + common.get_full_time() + '*', //商品名称
      };
      console.log(paramsJson);
      AV.Cloud.run('query_keys_amount', paramsJson).then((data) => {
        console.log(data);
        if (data < 10) {
          show_ad();
        } else {
          common.showToast('每日最多可以抽奖10次，请明日再来。')
        }
      });
    };
    let get_uid = () => {
      if (Boolean(app.globalData.userInfo)) {
        query_lottery(app.globalData.userInfo.uid);
      } else {
        app.userInfoReadyCallback = u => {
          query_lottery(u.uid);
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
          common.showToast('取消收取订阅消息您将无法获得中奖信息')
          get_uid();
        }
      });
    }
    request_subscribe_message(['qPdhctZF31bJcXr4gqLrFbsVhXXFYBY3MCFjxZ5H4fQ', 'k2_YJUliPs0h1SyNa2u1IUP4hJWE2pJkv8S0t1Uyx7k'])
  },

  //出现和隐藏弹出框
  showModal: function (idx,color) {
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

  //authorize
  authorize(e){
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
          authorize:true,
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
        wx.showLoading({title: '加载中',});
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
  query_authorize(){
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
    let {appid,path,data} = e.currentTarget.dataset;
    common.nav_to_program(appid, path, data);
  },

  // bind_close_qrcode() {
  //   let that = this;
  //   that.hide_qrcode();
  // },

  // copy_wechatid(e) {
  //   let that = this;
  //   console.log(that.data.good.seller.appid);
  //   wx.setClipboardData({
  //     data: that.data.good.seller.appid,
  //     success: function (res) {
  //       wx.getClipboardData({
  //         success: function (res) {
  //           wx.showToast({
  //             title: '复制成功'
  //           })
  //         }
  //       })
  //     }
  //   })
  // },
})
