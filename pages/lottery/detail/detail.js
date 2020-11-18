const AV = require('../../../utils/av-live-query-weapp-min');
const { User, Query, Cloud } = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let sharer = null; //分享人
let goodid = null;//s
let record_key = null;//用户点击抽奖返回的抽奖记录的key
let videoAd = null;
let interstitialAd = null;

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
    console.log(options);
    goodid = options.id;
  
    let that = this;
    that.preOnLoad();
    that.query_goods(options.id);
    // if (Boolean(options.sharer)) {
    //   sharer = options.sharer;
    //   setTimeout(() => {
    //     console.log('页面有uid信息，用户是被邀请的');
    //     common.getShares(options.sharer, app.globalData.userInfo.uid, '邀请用户' + app.globalData.userInfo.uid + '点击小程序卡片获得5积分奖励。', 5)
    //       .then((x) => {
    //         console.log(x);
    //       }).catch(console.error);
    //   }, 15000);
    // }
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
      key: 'item_'+id, //商品名称
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
      // let seller = {
      //   type:1,
      //   name:'SUGAR全球快闪店',
      //   data:'id=1',
      //   appid: 'wx8fc9502b8f83f501',//如果是用户的话，那么这个appid就是用户的微信号码
      //   path: 'pages/landing/landing',
      //   content:'你好呀，我是一个消息',
      // }
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
   * 观看广告完成，进入抽奖流程。
   */
  lottery(){
    let that = this;
    let paramsJson = {
      uid: app.globalData.userInfo.uid, //用户id
      gid: goodid,
      code: app.globalData.userInfo.code,
    };
    console.log(paramsJson);
    AV.Cloud.run('ad_lottery', paramsJson).then((data) => {
      if (data == 0) {
        //用户今日抽奖超过了10次
        console.log('已经超过次数');
        common.showToast('超过今日最大可抽奖次数');
      } else if (data == -1) {
        //用户抽奖出现错误
        console.log('用户鉴别失败');
        common.showToast('用户登录错误，请重新尝试')
      } else {
        //抽奖结果
        // user  period(期次) itemid number time_stamp type(0,1,2分别代表排列3排列4排列5)
        console.log(data);
        that.setData({
          ticket:data,
        });
        that.showModal();
      }
    });
  },
  /**
   * 
   */
  preOnLoad() {
    let that = this;
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-bf1f99265d10047c'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }
    //激励视频广告
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-d92d8a903b0bbd97'
      });
      videoAd.onLoad(() => {
        console.log('已经加载了广告');
      })
      videoAd.onError((err) => {
        console.log('加载失败');
      });
      videoAd.onClose((res) => {
        if (res.isEnded){
          that.lottery();
        }else{
          common.showToast('亲,观看完视频广告才可以参与抽奖哦');
        }
      });
    }
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
      let options = wx.getEnterOptionsSync()
      console.log(options);
      let options2 = wx.getLaunchOptionsSync()
      console.log(options2);
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
    console.log(app.globalData.userInfo.uid);
    let that = this;
    let title = '@你，分享一个有趣的抽奖活动，快来一起抽奖吧';
    let path = '/pages/lottery/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + goodid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path, 
      imageUrl: that.data.good.images,
    }
  },
  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },


  bind_close() {
    let that = this;
    that.hideModal();
  },

  bind_contact() {
    wx.showActionSheet({
      itemList: ['添加客服有奖励哟'],
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
    wx.showActionSheet({
      itemList: ['复制微信号码:' + e.currentTarget.dataset.appid],
      success(res) {
        wx.setClipboardData({
          data: e.currentTarget.dataset.appid,
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
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  bind_nav_mini_program(e){
    console.log(e);
    let {appid,path=null,data=null} = e.currentTarget.dataset;
    common.nav_to_program(appid,path,data);

  },

  bind_chick(){
    let that = this;
    that.hideModal();
    let show_ad = () => {
      if (videoAd) {
        videoAd.show().catch(() => {
          console.log('没有广告');
          common.showToast('加载广告频繁，稍后再试');
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

})