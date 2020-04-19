// pages/index/index.js

var baseUrl = require("../../utils/api.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //官方榜
    officialList: []
  },

  //打开排行榜
  openRanklingList: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../songSheet/songSheet?id=' + id + "&type=1",
    })
  },

  /**
   * 榜单内容摘要
   */
  getToplistDetail() {
    var that = this;
    wx.request({
      url: baseUrl + 'toplist/detail',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 200) {
          //console.log(res);
          var list = res.data.list;
          //console.log(list);
          var officialList = [];
          for (var index in list) {
            var name = list[index].name;
            if (name == "云音乐飙升榜" || name == "云音乐新歌榜" || name == "网易原创歌曲榜" || name == "云音乐热歌榜")
              officialList.push(list[index]);
          }
          that.setData({
            officialList
          })
        }
      }
    })
  },

  gotoSearch: function () {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getToplistDetail();
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