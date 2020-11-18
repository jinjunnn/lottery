const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
const {User,Query,Cloud} = require('../../utils/av-live-query-weapp-min');
let sharer = null;
let videoAd = null;
let interstitialAd = null;
let settings = null;
let wish_lottery_key = 'list_wish_lottery';
let list = 'list_handsel';
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
      let that = this;
      that.preOnLoad();
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
    that.query_settings();
    that.query_list();
    that.query_lottery(wish_lottery_key, index * 12, index * 12 + 11);
    that.query_free_list();
  },
  query_free_list() {
    let that = this;
    const paramsJson = {
      key: 'list_free_lottery',
      begin: 0,
      end: 3,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      that.setData({
        free_list: result,
      });
    });
  },

  query_balance(uid,code) {
    let that = this;
    let paramsJson = {
      uid: uid,
      code: code,
      field: 'f_balance'
    };
    console.log(paramsJson);
    AV.Cloud.run('query_user_field', paramsJson).then((data) => {
      that.setData({
        wishes: Number(data),
      });
    });


  },

  /**
   * 查询商铺的所有信息
   * 参数是listing 的id
   */
  query_list() {
    let that = this;
    const paramsJson = {
      key: list,
      begin: 0,
      end: 4,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((list) => {
      that.setData({
        list: list.map(item=>{
          item.times = item.price * 2 +30;
          return item;
        })
      });
    });
  },

  query_lottery(key,begin,end) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: begin,
      end: end,
    };
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      index++;
      lottery_list = lottery_list.concat(result);
      that.setData({
        lottery_list: lottery_list,
      });
    });
  },

  
  bind_nav(e) {
    common.navigateTo(e.currentTarget.dataset.url);
  },

  bind_switch(e) {
    common.switchTab(e.currentTarget.dataset.url);
  },
  /**
   * 积分兑换
   * 1.查询积分是不是足够，如果不够，则提示积分不足。
   * 2.云函数兑换，参数：uid,code,兑换项目itemid
   * 3.云函数返回，参数：
   */
  bind_exchange() {
    let nav = () => {
      wx.navigateTo({
        url: '/pages/user/contact/contact',
      });
    }
    let exchange = () => {
      let paramsJson = {
        uid: app.globalData.userInfo.uid,
        code: app.globalData.userInfo.code,
      };
      console.log(paramsJson);
      AV.Cloud.run('wish_exchange', paramsJson).then((data) => {
        console.log(data);
        if (data != 0) {
          common.showModal('请您添加客服的微信选号。', '兑换成功',nav);
        } else {
          common.showToast('您的积分不足，请先获得积分。');
        }
      });
    };
    let get_uid = () => {
      if (Boolean(app.globalData.userInfo)) {
        exchange(app.globalData.userInfo.uid);
      } else {
        app.userInfoReadyCallback = u => {
          exchange(u.uid);
        };
      }
    };
    get_uid();
  },

  /**
   * 
   */
  preOnLoad() {
    let that = this;
    // 在页面onLoad回调事件中创建插屏广告实例
    let send_wish = () => {
        let paramsJson = {
          uid: app.globalData.userInfo.uid,
          code: app.globalData.userInfo.code,
        };
        AV.Cloud.run('send_wish_tapad', paramsJson).then((data) => {
          if (data > 0) {
            common.showToast('恭喜您获得'+data+'积分积分');
          } else if (data==0){
            common.showToast('您今日已经观看超过20次广告，暂时无法获得积分');
          }else {
            common.showToast('您暂时无法获得积分');
          }
          console.log(data);
        });
    }
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-bf1f99265d10047c'
      })
      interstitialAd.onLoad(() => {
        console.log('已经加载了插屏广告');
        // 在适合的场景显示插屏广告
        if (interstitialAd) {
          setTimeout(() => {
              interstitialAd.show().catch((err) => {
                console.error(err)
              })
          }, 10000);
        }
      })
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
        if (res.isEnded) {
          send_wish();
        } else {
          common.showToast('亲,观看完视频才可以获得积分哦');
        }
      });
    }
  },

  bind_chick() {
    let that = this;
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
    let request_subscribe_message = (tmpids) => {
      wx.requestSubscribeMessage({
        tmplIds: tmpids,
        success(res) {
          console.log(res);
          show_ad();
        },
        fail(res) {
          common.showToast('取消收取订阅消息您将无法获得中奖信息')
          show_ad();
        }
      });
    }
    request_subscribe_message(['qPdhctZF31bJcXr4gqLrFbsVhXXFYBY3MCFjxZ5H4fQ', 'k2_YJUliPs0h1SyNa2u1IUP4hJWE2pJkv8S0t1Uyx7k'])
  },

  /**
   * 查询配置信息
   */
  query_settings() {
    let that = this;
    if (Boolean(app.globalData.userInfo)) {
      console.log('设置信息');
      that.query_balance(app.globalData.userInfo.uid, app.globalData.userInfo.code);
      that.setData({
        user: app.globalData.userInfo,
      });
    } else {
      app.userInfoReadyCallback = u => {
        console.log('进入callback函数');
        console.log(u);
        that.query_balance(u.uid, u.code);
        that.setData({
          user: u,
        });
      };
    }
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
    that.query_lottery(wish_lottery_key, index * 12, index * 12 + 11);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    let sharer = app.globalData.userInfo.uid;
    console.log(sharer);
    let ticket = common.get_timestamp();
    console.log(ticket);
    let {
      wish_page_share_title = null, wish_page_share_image = null
    } = that.data.settings;
    let path = '/pages/share/share?sharer=' + sharer + '&ticket=' + ticket; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(path);

    return {
      title: wish_page_share_title,
      path: path,
      imageUrl: wish_page_share_image,
    };
  },
  onShareTimeline() {
    let that = this;
    let sharer = app.globalData.userInfo.uid;
    console.log(sharer);
    let ticket = common.get_timestamp();
    console.log(ticket);
    let {
      wish_page_share_title = null, wish_page_share_image = null
    } = that.data.settings;
    let path = '/pages/wish/wish?sharer=' + sharer; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(path);

    return {
      title: wish_page_share_title,
      path: path,
      imageUrl: wish_page_share_image,
    };
  }
})