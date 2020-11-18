/**
 * 分享落地页
 */
const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
const {User,Query,Cloud} = require('../../utils/av-live-query-weapp-min');
let sharer = null;
let ticket = null;
let index = 0; //scan 游标的起始位置
let list = [];
let videoAd = null;
let interstitialAd = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    sharer = options.sharer;
    ticket = options.ticket;
    let that = this;
    if (Boolean(app.globalData.userInfo)) {
      if (app.globalData.userInfo.uid==sharer){
        that.setData({
          tap_status: -1,
        });
      }else{
        that.query_click_wish_info(ticket, app.globalData.userInfo.uid);
      }
    } else {
      app.userInfoReadyCallback = u => {
        console.log(u)
        if (u.uid == sharer) {
          that.setData({
            tap_status: -1,
          });
        } else {
          that.query_click_wish_info(ticket, u.uid);
        }
      };
    }
    that.preOnLoad();
  },
  /**
   * 查询用户是否助力过；
   * @param {} ticket 
   * @param {*} uid 
   */
  query_click_wish_info(ticket,uid) {
      let that = this;
      let paramsJson = {
        key: 'ticket_' + ticket,
        value: uid,
      };
      console.log(paramsJson);
      AV.Cloud.run('exist_member', paramsJson).then((data) => {
        console.log(data);
        that.setData({
          tap_status:data,
        });
        // wx.hideLoading();
      }).then(() => {
      });
  },

  /**
   * 给用户点赞   
   * @param {} uid 
   * @param {*} itemid 
   */
  send_wish(uid, itemid) {
    console.log(app.globalData.userInfo);
    let that = this;
    let paramsJson = {
      sharer:sharer,
      ticket: ticket,
      uid:app.globalData.userInfo.uid,
      code: app.globalData.userInfo.code,
      user: app.globalData.userInfo.is_new_user,
    };
    console.log(paramsJson);
    AV.Cloud.run('send_wish', paramsJson).then((data) => {
      if (data==0) {
        that.setData({
          tap_status: 1,
        });
        common.showToast('您已经助力过用户啦');
      }else if(data==-1){
        common.showToast('系统问题，请您稍后再试');
      }else{
        common.showToast('恭喜您获得'+ data+'积分积分');
        that.setData({
          tap_status: 1,
          reward:data,
        });
      }
    });
  },

  bind_nav(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },
  bind_switch_tab(e) {
    wx.switchTab({
      url: e.currentTarget.dataset.url,
    });
  },
  /**
   * 免费抽奖 list
   */
  query_lottery_list(){
      let that = this;
      const paramsJson = {
        key: 'list_free_lottery',
        begin: 0,
        end: 9,
      };
      console.log(paramsJson);
      AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
        that.setData({
          free_lottery_list: result,
        });
      });
  },
  /**
   * 积分抽奖 list
   */
  query_wish_lottery_list(){
      let that = this;
      const paramsJson = {
        key: 'list_wish_lottery',
        begin: 0,
        end: 9,
      };
      console.log(paramsJson);
      AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
        that.setData({
          wish_lottery_list: result,
        });
      });
  },

  query_settings() {
    let that = this;
    console.log('进入query_settings流程');
    if (Boolean(app.globalData.settings)) {
      that.setData({
        settings: app.globalData.settings,
      });
    } else {
      app.appSettingsCallback = s => {

        that.setData({
          settings: s,
        });
      };
    }
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
      AV.Cloud.run('wish_exchange', paramsJson).then((data) => {
        if (data != 0) {
          common.showModal('请您添加客服的微信选号。', '兑换成功',nav);
        } else {
          common.showToast('您的积分不足，请先获得积分。');
        }
        console.log(data);
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
          if (data != -1) {
            common.showToast('恭喜您获得'+data+'积分积分');
          } else {
            common.showToast('您的积分不足，请先获得积分。');
          }
          console.log(data);
        });
    }
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-d1c2184c3c23f26d'
      })
      interstitialAd.onLoad(() => {
          // 在适合的场景显示插屏广告
          if (interstitialAd) {
            setTimeout(() => {
              interstitialAd.show().catch((err) => {
                console.error(err)
              })
            }, 3000);

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
    that.query_lottery_list();//查询抽奖信息列表
    that.query_wish_lottery_list(); //查询抽奖信息列表
    that.query_settings();//查询页面配置
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
  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  //   },

  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {
  //   let that = this;
  //   that.query_intergal();
  // },
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
      share_page_share_title = null, share_page_share_image = null
    } = that.data.settings;
    let path = '/pages/share/share?sharer=' + sharer + '&ticket=' + ticket; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(path);
    return {
      title: share_page_share_title,
      path: path,
      imageUrl: share_page_share_image,
    };
  }
})






