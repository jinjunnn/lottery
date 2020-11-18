const AV = require('../../../utils/av-live-query-weapp-min');
const {
  User,
  Query,
  Cloud
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let sharer = null; //分享人
let goodid = null; //
let videoAd = null;
let interstitialAd = null;
let handsel_key = null;
let times = 0 ;
let list = 'list_handsel';
let wish_lottery_key = 'list_wish_lottery';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showqrcode:false,  //是否显示二维码
    icon_lottery: 'cloud://sugar-ixki6.7375-sugar-ixki6-1300511865/icons/抽奖.png',
    icon_share: 'cloud://sugar-ixki6.7375-sugar-ixki6-1300511865/icons/分享.png',
    backgroundColor: "",
    image: 'http://lc-0EaEC5sQ.cn-n1.lcfile.com/501d9cc2adaad6071408/%E9%94%99%E5%8F%B7.png',
    icon_xiaochengxu01: image.xiaochengxu01,
    icon_xiaochengxu02: image.xiaochengxu02,
    icon_wechat: image.wechat,
    icon_wechat_add: image.wechat_add,
    exist_handsel : 1,  //是否存在handsel_key；
    times:49,
    showreward:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    goodid = options.id;
    console.log(goodid);
    let that = this;
    let pre_onload = () => {
      // 在页面onLoad回调事件中创建插屏广告实例
      if (wx.createInterstitialAd) {
        interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-bf1f99265d10047c'
        })
        interstitialAd.onLoad(() => { })
        interstitialAd.onError((err) => { })
        interstitialAd.onClose(() => { })
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
            that.update_handsel();
          } else {
            common.showToast('观看完成广告才可以砍价成功哦！');
          }
        });
      }
    }
    that.query_goods(options.id);
    that.query_list();
    if (Boolean(options.sharer)) {
        //从分享卡片进入
        console.log(options.sharer);
        sharer = options.sharer;
        handsel_key = options.handsel_key;
        //从 sharer页面进入
        if (Boolean(app.globalData.userInfo)) {
            console.log(app.globalData.userInfo);
            that.query_handsel(options.handsel_key, app.globalData.userInfo.uid);
        } else {
          app.userInfoReadyCallback = u => {
            console.log(u);
            that.query_handsel(options.handsel_key,u.uid);
          };
        }
    } else{
        //从 handsel页面进入
        if (Boolean(app.globalData.userInfo)) {
            that.exist_handsel(app.globalData.userInfo.uid);
        } else {
          app.userInfoReadyCallback = u => {
            that.exist_handsel(u.uid);
          };
        }
    }
    pre_onload();
  },
  //加速
  bind_quicken(){
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,});
    let get_more_intergal = () => {
        wx.switchTab({
          url: '/pages/wish/wish'
        });
    }
    let paramsJson = {
      key: that.data.handsel.key, //商品名称
    };
    AV.Cloud.run('handsel_quicken', paramsJson).then((data) => {
      console.log(data.code);
      if(data.code==1){
          let left = Number(data.data.total) - Number(data.data.paid);
          let times = parseInt(left / 50);
          console.log(times);
          that.setData({
            handsel:data.data,
            times: times,
          });
          common.showToast('加速完成');
      }else if(data.code==-1){
          common.showToast('您已经加速过');
      }else if(data.code == 0){
        common.showModal('去获得更多积分','您的积分不足',get_more_intergal)
      }
      
      wx.hideLoading();
    });
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
      good.times = Number(good.price) * 2;
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
        sharer: sharer,
      });
      wx.hideLoading();
    });
  },
  /**
   * 创建砍价
   */
  bind_create_handsel(){
    let that = this;
    let paramsJson = {
      uid: app.globalData.userInfo.uid,
      goodid:goodid,
    };
    console.log(paramsJson);
    AV.Cloud.run('create_handsel', paramsJson).then((data) => {
      console.log(data.expired);
      that.getLeftTime(data.expired);
      let left = Number(data.total) - Number(data.paid);
      let times = Math.ceil(left / 50);
      console.log(times);
      that.setData({
        handsel:data,
        exist_handsel:1,
        times:times,
        sharer:null,
      });
      that.showModal();
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
      end: 11,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((list) => {
      that.setData({
        list: list
      });
    });
  },
  /**
   * 
   * 砍价
   */
  update_handsel() {
    let that = this;
    console.log(app.globalData.userInfo);
    let paramsJson = {
      uid: app.globalData.userInfo.uid,
      handsel_key: handsel_key,
      is_new_user: app.globalData.userInfo.is_new_user,
      code: app.globalData.userInfo.code,
      groupid: app.globalData.groupid,
    };
    console.log(paramsJson);
    AV.Cloud.run('update_handsel', paramsJson).then((data) => {
      console.log(data);
      if(data==-1){
          common.showToast('活动太火爆了，请明日再试');
      }else if(data==0){
          common.showToast('今日抽奖已经超过6次，请明日再试');
      }else{
          let left = Number(data.total) - Number(data.paid);
          let times = Math.ceil(left / 50);
          console.log(times);
          console.log(data);
          that.setData({
            handsel: data,
            exist_handsel: 1,
            times: times,
          });
          that.showModal();
      }
    });
  },
  /**
   * 查询 用户是否有砍过价   
   * @param {} handsel 
   */
  exist_handsel(uid) {
    let that = this;
    handsel_key = 'hs_' + uid + '_' + goodid;
    let paramsJson = {
      key: 'hs_' + uid + '_' + goodid
    };
    console.log(paramsJson);
    AV.Cloud.run('getHash', paramsJson).then((data) => {
          console.log(data);
          if(data== null){
            console.log('没有砍过');
            that.setData({
              exist_handsel:0,
              uid:app.globalData.userInfo.uid,
            });
          }else{
            that.getLeftTime(data.expired);
            let left = Number(data.total) - Number(data.paid);
            let times = Math.ceil(left / 50);
            data.paid = Number(data.paid);
            data.total = Number(data.total);
            console.log(times);
            that.setData({
              handsel: data,
              uid: app.globalData.userInfo.uid,
              times: times,
            });
          }
    });
},

  /**
   * 助力砍价后 点击进入新的项目
   * @param {} handsel 
   */
  bind_nav_new_item() {
    let that = this;
    wx.redirectTo({
      url: '/pages/handsel/detail/detail?id='+that.data.list[0].id,
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },


  bind_get_award(){
    let that = this;
    let incre_handsel_times = () =>{
        let paramsJson = {
          key: 'get_handsel_times',
          field: app.globalData.userInfo.uid,
          value:1
        };
        console.log(paramsJson);
        AV.Cloud.run('increField', paramsJson).then((result) => {
          console.log(result);
        });
    }
    let created = () =>{
        let paramsJson = {
          key: handsel_key,
        };
        console.log(paramsJson);
        AV.Cloud.run('getHash', paramsJson).then((data) => {
          console.log(data);
          // 声明 class
          const Handsel = AV.Object.extend('Handsel');
          const handsel = new Handsel();
          handsel.set('user', app.globalData.userInfo.uid);
          handsel.set('item', data.goodid);
          handsel.set('key', data.key);
          handsel.set('times', data.times);
          handsel.set('send', false);
          handsel.set('name', that.data.good.name);
          handsel.set('price', that.data.good.price);
          handsel.set('image', that.data.good.image);
          handsel.set('type', 2);
          handsel.save().then((result) => {
            incre_handsel_times()
            that.setData({
              award: result
            });
            common.showToast('请联系客服领取奖励');
          }, (error) => {
            // 异常处理
          });
        });
    }
    let query_award = ()=>{
        const query = new AV.Query('Handsel');
        query.equalTo('user', app.globalData.userInfo.uid);
        query.equalTo('key', handsel_key);
        query.first().then((result) => {
          console.log(result);
          if(result){
            that.show_reward();
            that.setData({
              award:result,
            });
          }else{
            console.log('没有领取过')
            created();
          }
        });
    }
    query_award();
  },
  /**
   * 查询砍价信息
   */
  query_handsel(handsel) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    let paramsJson = {
      key: handsel, //商品名称
    };
    console.log(paramsJson);
    AV.Cloud.run('getHash', paramsJson).then((data) => {
      console.log(data);
      let left = Number(data.total) - Number(data.paid);
      let times = Math.ceil(left / 50);
      data.paid = Number(data.paid);
      data.total = Number(data.total);
      that.getLeftTime(data.expired);
      that.setData({
        handsel: data,
        uid: app.globalData.userInfo.uid,
        times:times,
      });
      wx.hideLoading();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      let that =this;
      that.query_settings();
      that.query_lottery(wish_lottery_key);
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

  query_lottery(key) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: 0,
      end: 29,
    };
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      console.log(result);
      that.setData({
        lottery_list: result,
      });
    });
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    sharer = null;
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
    // 显示shareticket
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '我正在抢这个宝贝，还差' + that.data.times + '次砍价，帮帮我砍价免费拿。';
    let path = '/pages/handsel/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + goodid + '&handsel_key=' + handsel_key; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(title);
    console.log(path);
    console.log(that.data.good.image);
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
            AV.Cloud.run('groupId', paramsJson)
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

  onShareTimeline(){
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '我正在抢这个宝贝，还差' + that.data.times + '次砍价，帮帮我砍价免费拿。';
    let path = '/pages/handsel/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + goodid + '&handsel_key=' + handsel_key; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(title);
    console.log(path);
    console.log(that.data.good.image);
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
            AV.Cloud.run('groupId', paramsJson)
          }
        })
      }
    }
  },

  copy_wechatid(e){
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

  bind_close() {
    let that = this;
    that.hideModal();
  },

  bind_close_qrcode(){
    let that = this;
    that.hide_qrcode();
  },

  bind_close_reward(){
    let that = this;
    that.hide_reward();
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
      path = null,
      data = null
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
          common.showToast('未加载广告，请稍后再试');
          videoAd.load()
            .then(() => videoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败');
            });
        });
      }
    };
    let query_lottery = (uid) => {
      let user_today_handsel_times_key = 'handsel_today_' + common.get_full_time(); //查询今日用户抽奖次数的 key
      let paramsJson = {
        key: user_today_handsel_times_key, //商品名称
        field: uid,
      };
      console.log(paramsJson);
      AV.Cloud.run('getField', paramsJson).then((data) => {
        console.log(data);
        if (data >= 6) {
          common.showToast('每日最多可累计助力6次，请明日再来。')
        } else {
          show_ad();
        }
      });
    };


    let query_handsel_this_item = () =>{
          let that = this;
          let paramsJson = {
            key: 'attend_handsels', //商品名称
            field: handsel_key +'_' +app.globalData.userInfo.uid,
          };
          console.log(paramsJson);
          AV.Cloud.run('hasField', paramsJson).then((data) => {
            console.log(data);
            if (data == 0) {
              query_lottery(app.globalData.userInfo.uid);
            } else {
              that.setData({
                tapped:true,
              });
              common.showToast('您已经助力过！')
            }
          });
    }
    let request_subscribe_message = (tmpids) => {
      wx.requestSubscribeMessage({
        tmplIds: tmpids,
        success(res) {
          query_handsel_this_item(app.globalData.userInfo.uid);
        },
        fail(res) {
          query_handsel_this_item(app.globalData.userInfo.uid);
        }
      });
    }
    request_subscribe_message(['zPUv2h2UGyQAkhy4o9h_jZSsgJJImezeX87yXMJwOEs'])
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

  //出现和隐藏弹出框
  show_reward: function () {
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
        showreward: true,
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
  hide_reward: function () {
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
        showreward: false,
        backgroundColor: "",
      });
    }.bind(this), 200);
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
        expired:false
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        this.setData({
          countDownDay: '00',
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
          expired:true,
        });
      }
    }.bind(this), 1000);
  },
})