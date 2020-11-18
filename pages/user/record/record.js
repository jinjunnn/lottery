const {
  User
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();
let key_ = null; //record_19_  或者 record_20_
let code;
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
      console.log(options);
      key_ = options.records;
      let donate = (i, index) => {
        let item = i;
        if (index % 8 == 0) {
          item.load_add = true;
        }
        if (!code.hasOwnProperty(item.period)) {
          item.result = -1;
          item.mcode = null;
          return(item);
        } else if (code[item.period] != item.code) {
          item.result = 0;
          item.mcode = code[item.period];
          return (item);
        }else{
          item.result = 1;
          item.mcode = code[item.period];
          return (item);
        }
      };
      let query_records = () => {
        let paramsJson = {
          key: key_ + app.globalData.userInfo.uid, // 'record_19_' + app.globalData.userInfo.uid,
          begin: 0,
          end: 139,
        };
        AV.Cloud.run('get_list_details', paramsJson).then(records => {
            let lst = [];
            records.map((item,index)=> {
              console.log(item);
              if (item) {
                lst.push(donate(item,index));
              }
            });
            wx.hideLoading();
            that.setData({
              records: lst
            });
        });
      };
      let query_code = () => {
            wx.showLoading({
              title: '加载中',
              mask: true,
            });
            let paramsJson = {
              key: 'lottery_result', 
            };
            AV.Cloud.run('getHash', paramsJson).then(data => {
                code = data;
                query_records();
            });
      };
      query_code();
  },

  bind_get_award(e) {
    let {key,gid,mcode} = e.currentTarget.dataset;
    console.log(key, mcode);
    let that = this;
    let incre_handsel_times = () => {
      let paramsJson = {
        key: 'get_wish_lottery_times',
        field: app.globalData.userInfo.uid,
        value: 1
      };
      console.log(paramsJson);
      AV.Cloud.run('increField', paramsJson).then((result) => {
        console.log(result);
      });
    }

    let created = () => {
      let paramsJson = {
        key: key,
      };
      console.log(paramsJson);
      AV.Cloud.run('getHash', paramsJson).then((data) => {
        console.log(data);
        // 声明 class
        const Handsel = AV.Object.extend('Handsel');
        const handsel = new Handsel();
        handsel.set('user', app.globalData.userInfo.uid);
        handsel.set('item', data.gid);
        handsel.set('key', key);
        handsel.set('period', data.period);
        handsel.set('mcode', mcode);
        handsel.set('code', data.code);
        handsel.set('name', that.data.good.name);
        handsel.set('price', that.data.good.price);
        handsel.set('image', that.data.good.image);
        handsel.set('type', 1);
        // handsel.set('times', data.times);   这里之后要放用户累计抽了多少次将，中了多少次奖。
        handsel.set('send', false);
        handsel.save().then((result) => {
          incre_handsel_times();
        }, (error) => {
          // 异常处理
        });
      });
    };

    let get_image = () => {
      let paramsJson = {
        key: 'item_'+gid,
        field: 'image',
      };
      console.log(paramsJson);
      AV.Cloud.run('getHash', paramsJson).then((result) => {
        console.log(result);
          that.setData({
            image: result.image,
            good:result,
            gid:gid,
          });
          that.show_reward();
      });
    }

    let query_award = () => {
      console.log(123);
      const query = new AV.Query('Handsel');
      query.equalTo('user', app.globalData.userInfo.uid);
      query.equalTo('key',key);
      query.first().then((result) => {
        console.log(result);
        get_image();
        if (!result){
          created();
        }
      });
    }

    query_award();
  },

  bind_close_reward() {
    let that = this;
    that.hide_reward();
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {


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
    console.log(12345);
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '我已经抽中了这个商品！快来一起抽吧！';
    let path = '/pages/wish/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + that.data.gid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(title,path,that.data.image);
    return {
      title: title,
      path: path,
      imageUrl: that.data.image,
    }
  },


  onShareTimeline(){
    wx.showShareMenu({withShareTicket: true});
    let that = this;
    let title = '我已经抽中了这个商品！快来一起抽吧！';
    let path = '/pages/wish/detail/detail?sharer=' + app.globalData.userInfo.uid + '&id=' + that.data.gid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.image,
    }
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
})