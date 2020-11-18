const AV = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let goodid = null; //s
let record_key = null; //用户点击抽奖返回的抽奖记录的key
// 在页面中定义激励视频广告
let videoAd = null;
// 在页面中定义插屏广告
let interstitialAd = null;

let sharer = null;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon_lottery: 'cloud://sugar-ixki6.7375-sugar-ixki6-1300511865/icons/抽奖.png',
    icon_share: 'cloud://sugar-ixki6.7375-sugar-ixki6-1300511865/icons/分享.png',
    backgroundColor: "",
    image: 'http://lc-0EaEC5sQ.cn-n1.lcfile.com/501d9cc2adaad6071408/%E9%94%99%E5%8F%B7.png',
    icon_xiaochengxu01: image.xiaochengxu01,
    icon_xiaochengxu02: image.xiaochengxu02,
    icon_wechat: image.wechat,
    icon_wechat_add: image.wechat_add,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.groupid);
    console.log(options);
    goodid = options.id;
    if (options.hasOwnProperty('sharer')) {
      sharer = options.sharer;
    }
    let that = this;
    that.setData({
      button:options.button,
    })
    // 在页面onLoad回调事件中创建插屏广告实例
    let send_wish = () => {
      let paramsJson = {
        uid: app.globalData.userInfo.uid,
        code: app.globalData.userInfo.code,
      };
      AV.Cloud.run('send_wish_tapad', paramsJson).then((data) => {
        if (data != -1) {
          common.showToast('恭喜您获得' + data + '积分积分');
          that.query_balance();
        } else {
          // common.showToast('您的积分不足，请先获得积分。');
        }
        console.log(data);
      });
    };

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-23f8af65650972c7'
      })
      interstitialAd.onLoad(() => {
        that.setData({
          interstitialAd: true,
        });
      });
      interstitialAd.onError((err) => {
        that.setData({
          interstitialAd: false,
        });
      })
      interstitialAd.onClose(() => {})
    }
    //激励视频广告
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-d92d8a903b0bbd97'
      });
      videoAd.onLoad(() => {
        that.setData({
          adUnitId: true,
        });
      })
      videoAd.onError((err) => {
        that.setData({
          adUnitId: false,
        });
      });
      videoAd.onClose((res) => {
        if (res.isEnded) {
          send_wish();
        } else {
          common.showToast('亲,观看完视频才可以获得积分哦');
        }
      });
    }
    that.query_goods(options.id);
  },
  /**
   * 如果用户通过分享者进入，给分享者发放积分奖励
   * @param {} id 
   */
  send_sharer_intergal(sharer,ticket){
      let that = this;
      if(sharer!=app.globalData.userInfo.uid){
          let paramsJson = {
            sharer: sharer,
            code: app.globalData.userInfo.code,
            uid: app.globalData.userInfo.uid,
            ticket:ticket,
          };
          AV.Cloud.run('send_wish', paramsJson).then((data) => {
              console.log(data);
          });
      }
  },

  /**
   * 加载广告中
   * @param {j} id 
   */
  bind_loadad(){
    common.showToast('内容加载中请稍后')
  },
  /**
   * 查询商品信息
   */
  query_goods(id) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    let paramsJson = {
      key: 'item_' + id, //商品名称
    };
    console.log(paramsJson);
    AV.Cloud.run('getHash', paramsJson).then((data) => {
      wx.setNavigationBarTitle({
        title: data.name,
      });
      let good = data;
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
   * 积分抽奖
   * 1.查询积分是不是足够，如果不够，则提示积分不足。
   * 2.云函数抽奖，参数： uid,code,抽奖项目itemID，
   * 3.云函数返回，参数：抽奖结果。
   */
  lottory() {
    let that = this;
    that.hideModal();
    let lottery = () =>{
      let paramsJson = {
        uid: app.globalData.userInfo.uid,
        code: app.globalData.userInfo.code,
        gid: goodid,
        groupid: app.globalData.groupid,
        sharer:sharer,
      };
      console.log(lottery);
      AV.Cloud.run('wish_lottery', paramsJson).then((data) => {
          if (data == 0) {
            //用户今日抽奖超过了10次
            console.log('已经超过次数');
            common.showToast('积分不足');
          } else if (data == -1) {
            //用户抽奖出现错误
            console.log('用户鉴别失败');
            common.showToast('用户登录错误，请重新尝试')
          } else {
            //抽奖结果
            // user  period(期次) itemid number time_stamp type(0,1,2分别代表排列3排列4排列5)
            console.log(data);
            sharer = null;//因为用户的每一次分享，只能获得一次积分赠送，所以这里将sharer =null
            data.code_list = data.code.split("");
            that.setData({
              ticket: data,
            });
            that.query_balance();
            that.showModal();
          }

      });
    }
    let request_subscribe_message = (tmpids) => {
      wx.requestSubscribeMessage({
        tmplIds: tmpids,
        success(res) {
          console.log(res);
          lottery();
        },
        fail(res) {
          common.showToast('取消收取订阅消息您将无法获得中奖信息')
          lottery();
        }
      });
    }
    request_subscribe_message(['qPdhctZF31bJcXr4gqLrFbsVhXXFYBY3MCFjxZ5H4fQ', 'k2_YJUliPs0h1SyNa2u1IUP4hJWE2pJkv8S0t1Uyx7k'])
    },

    /**
     * 积分兑换
     * 1.查询积分是不是足够，如果不够，则提示积分不足。
     * 2.云函数兑换，参数：uid,code,兑换项目itemid
     * 3.云函数返回，参数：
     */
    exchange() {
      console.log(app.globalData.userInfo);
      let paramsJson = {
        uid: app.globalData.userInfo.uid,
        code: app.globalData.userInfo.code,
      };
      AV.Cloud.run('wish_exchange', paramsJson).then((data) => {
        if(data != 0){
          common.showModal('请于客服联系选号。','兑换成功');
          that.query_balance();
        }else{
          that.query_balance();
          common.showToast('您的积分不足，请先获得积分。');
        }
        console.log(data);
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
    that.query_balance();
  },

  query_balance(){
    let that = this;
    let query_balance =(uid,code) =>{
        let paramsJson = {
          uid: uid,
          code: code,
          field:'f_balance'
        };
        console.log(paramsJson);
        AV.Cloud.run('query_user_field', paramsJson).then((data) => {
          that.setData({
            balance:Number(data),
          })
        });
    }
    if (Boolean(app.globalData.userInfo)) {
      query_balance(app.globalData.userInfo.uid, app.globalData.userInfo.code)
    } else {
      app.userInfoReadyCallback = u => {
        query_balance(u.uid,u.code);
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '免费抽奖！第三方公正开奖！我的好友都抽到了，快来撸！';
    let ticket = common.get_timestamp();
    let path = '/pages/wish/detail/detail?sharer=' + app.globalData.userInfo.uid + '&button=2&id=' + goodid +'&ticket=' + ticket; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.good.image, 
      complete: function (res) {
        console.log(res);
        var shareTickets = res.shareTickets;
        if (shareTickets.length == 0) {
          return false;
        }
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function (res) {
            var encryptedData = res.encryptedData;
            var iv = res.iv;
            var paramsJson = {
              user: AV.User.current().id,
              encryptedData: encryptedData,
              iv: iv,
              sessionKey: User.current().attributes.authData.lc_weapp.session_key,
            }
            Cloud.run('groupId', paramsJson)
          }
        })
      }
    }
  },
  onShareTimeline() {
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '免费抽奖！第三方公正开奖！我的好友都抽到了，快来撸！';
    let ticket = common.get_timestamp();
    let path = '/pages/wish/detail/detail?sharer=' + app.globalData.userInfo.uid + '&button=2&id=' + goodid + '&ticket=' + ticket; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.good.image,
      complete: function (res) {
        console.log(res);
        var shareTickets = res.shareTickets;
        if (shareTickets.length == 0) {
          return false;
        }
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function (res) {
            var encryptedData = res.encryptedData;
            var iv = res.iv;
            var paramsJson = {
              user: AV.User.current().id,
              encryptedData: encryptedData,
              iv: iv,
              sessionKey: User.current().attributes.authData.lc_weapp.session_key,
            }
            Cloud.run('groupId', paramsJson)
          }
        })
      }
    }
  },
  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },


  bind_close() {
    interstitialAd.show().catch((err) => {
      console.error(err)
    })
    let that = this;
    that.hideModal();

  },

  bind_contact() {
    wx.showActionSheet({
      itemList: ['添加客服可获赠一张彩票'],
      success(res) {
        wx.navigateTo({
          url: '/pages/user/contact/contact',
        });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  bind_display_qrcode(e) {
    let that = this;
    that.show_qrcode();
  },

  bind_nav_mini_program(e) {
    console.log(e);
    let {
      appid,
      path,
      data
    } = e.currentTarget.dataset;
    common.nav_to_program(appid, path, data);

  },

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
  showModal: function () {
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
      showModalStatus: true,
      backgroundColor: "bg_color",
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
        showModalStatus: false,
        backgroundColor: "",
      });
    }.bind(this), 200);
  },
  bind_close_qrcode() {
    let that = this;
    that.hide_qrcode();
  },
  copy_wechatid(e) {
    let that = this;
    console.log(that.data.good.seller.appid);
    wx.setClipboardData({
      data: that.data.good.seller.appid,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },

    //出现和隐藏弹出框
  show_qrcode: function () {
    // 显示遮罩层
    console.log('显示遮罩层');
    //这部分代码是修改 navigationbar颜色的。
    // wx.setNavigationBarColor({
    //   frontColor: '#ffffff',
    //   backgroundColor: '#ff0000',
    //   animation: {
    //     duration: 400,
    //     timingFunc: 'easeIn'
    //   }
    // })
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
      showqrcode: true,
      backgroundColor: "bg_color",
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },

  // 隐藏遮罩层
  hide_qrcode: function () {
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
        showqrcode: false,
        backgroundColor: "",
      });
    }.bind(this), 200);
  },

})


