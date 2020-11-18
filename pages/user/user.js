const {
  User
} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {
    display:false,
    icon_box: image.box,
    icon_team: image.team,
    icon_arrow: image.arror_icon,
    icon_lottery: image.lottery,
    icon_order: image.icon_order,
    icon_fuwu: image.fuwu,
    icon_lipinka: image.lipinka,
    icon_hezuo: image.hezuo,
    icon_yongjin: image.yongjin,
    icon_qrcode:image.qrcode_icon,
    icon_invite:image.invite_icon,
    icon_coins: '../../image/我的钱包.png',
    icon_intergal: '../../image/积分.png',
    icon_key: '../../image/花.png',
    icon_user: '../../image/用户.png',
    icon_service: '../../image/客服.png',
    referee: '',
    wallet: '',
    order: '',
    notice: '',
    referee: '',
    userimage: '',
    referee: '',
  },
  onLoad: function () {
    let that = this;
    wx.setNavigationBarTitle({
      title: '我的'
    });
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.userInfo']) {
          wx.navigateTo({
            url: './login/login',
          });
        }else{
          that.setData({
            display:true,
          });
        }
      }
    });
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '我的'
    });
    wx.showLoading({
      title: '加载中',
      mask:true,
    });
    let that = this;
    that.query_settings();
    if (Boolean(app.globalData.userInfo)) {
      console.log(app.globalData.userInfo);
      let paramsJson = {
        uid: app.globalData.userInfo.uid,
      };
      console.log(paramsJson);
      AV.Cloud.run('get_user_info', paramsJson).then(x => {
        wx.hideLoading();
        that.setData({
          user: x,
          display:true,
        });
      });
    } else {
      app.userInfoReadyCallback = u => {
        wx.hideLoading();
        that.setData({
          user: u, 
          display:true,
        });
      };
    }
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
   * 
   */
  bind_balance(){
    let that = this;
    console.log(that.data.settings)
    if ( that.data.settings.display_toast_verify == 1) {
        wx.showToast({
          title: '金币满10元可以提取。点击Banner广告随机会获得1元金币奖励。中奖概率10%。群抽奖的发起人成功完成群抽奖即可获得5金币。',
          icon: 'none',
          duration: 5000
        });
    }
  },

  /**
   * 
   */
  bind_intergal() {
    let that = this;
    console.log(that.data.settings)
    if (that.data.settings.display_toast_verify == 1) {
      wx.showToast({
        title: '银币可以兑换商品。点击Banner广告随机会获得1元银币奖励。中奖概率20%。',
        icon: 'none',
        duration: 5000
      });
    }
  },

  /**
   * 微信群
   */
  completemessage(e){
    console.log(e.detail.errcode);
    common.showModal('客服微信群已经下发到服务通知中，您可以在【服务通知】中添加','下发完成')
  },

  /**
   * 未完成的功能
   */
  setting() {
    wx.showModal({
      title: '通知',
      content: '金币、积分、积分兑换皮肤道具大礼即将开启，请您耐心等待。',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },
  bind_contact() {
    wx.showActionSheet({
      itemList: ['添加企业微信客服'],
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


  bind_close() {
    console.log(124)
    let that = this;
    that.hideModal();
  },
  //出现和隐藏弹出框
  showModal: function (status) {
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
      showModalStatus: status,
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
  /**
   * 小程序码页面
   */
  bind_qrcode(e){
    wx.showActionSheet({
      itemList: ['邀请好友之后，好友的每笔交易您都将获得5%的佣金'],
      success(res) {
          wx.navigateTo({
            url: './qrcode/qrcode',
          });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
});

