// pages/search/search.js
var baseUrl = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //搜索值
    searchKey: "",
    //搜索结果列表
    showResult: false,
    //单曲列表
    singleList: [],
    //单曲页数
    singlePage: 2,
    singleloading: true,
    singleloadingmore: false,
  },


  //搜索事件
  gotoSearch: function (e) {
    //输入框值
    var searchValue = e.detail.value;
    const that = this;
    that.setData({
      singleloading: true
    });

    wx.request({
      url: baseUrl + 'search?keywords=' + searchValue,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 200) {
          var songs = res.data.result.songs;
          for (var index in songs) {
            var name = songs[index].album.name;
            var singerName = songs[index].artists[0].name;
            songs[index].al = {
              name
            }
            songs[index].ar = [{
              name: singerName
            }]
          }
          that.setData({
            showResult: true,
            singleList: songs,
            singlePage: 2,
            singleloading: false,
          });
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

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