var baseUrl = require('../../utils/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 歌单详情数据
    playInfo: [],
    privileges: [],
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    //console.log(id);
    if (id == 3779629)
      id = 0;
    if (id == 3778678)
      id = 1;
    if (id == 2884035)
      id = 2;
    if (id == 19723756)
      id = 3;
    this.getTopList(id);
  },

  /**
   * 获取排行榜数据
   */
  getTopList(id) {
    let that = this;
    wx.request({
      url: baseUrl + 'top/list?idx=' + id,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 200) {
          that.setData({
            playInfo: res.data.playlist,
            privileges: res.data.privileges,
            loading: false
          })
        }
      }
    })
  },

  /**
   * 播放音乐
   */
  playMusic:function(e){
    var that = this;
    var audioId = e.currentTarget.dataset.id;
    //console.log(audioId);
    wx.navigateTo({
      url: '../player/player?id'+audioId
    })
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

  }
})