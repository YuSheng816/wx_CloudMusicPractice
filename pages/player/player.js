// pages/player/player.js
var baseUrl = require("../../utils/api.js");
const util = require('../../utils/util.js');
const audio = require('../../utils/backgroundAudio.js');
var WxNotificationCenter = require("../../utils/WxNotificationCenter.js");
const app = getApp();
const backgroundAudioManager = app.globalData.backgroundAudioManager;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    music: {},
    lyricsList: [],
    showLyric: false, // 是否显示歌词
    curLrcIndex: 0, // 当前播放的歌词index
    currentTime: '00:00', //进度时长
    duration: '00:00', //总时长
    sliderValue: 0, //滑块当前值
    sliderMax: 0, //滑块最大值
    isMovingSlider: false, // 手动拖动触发slider更新
    curPlayList: [], // 歌曲列表
    playing: false, // 是否正在播放
    playMode: 1,
    // 循环类型集合
    modeList: [{
        id: 1,
        name: '列表循环',
        icon: '../../images/cm2_icn_loop@2x.png',
        icon2: '../../images/cm2_playlist_icn_loop@2x.png'
      },
      {
        id: 2,
        name: '单曲循环',
        icon: '../../images/cm2_icn_one@2x.png',
        icon2: '../../images/cm2_playlist_icn_one@2x.png'
      },
      {
        id: 3,
        name: '随机播放',
        icon: '../../images/cm2_icn_shuffle@2x.png',
        icon2: '../../images/cm2_playlist_icn_shuffle@2x.png'
      }
    ],
  },

  modeChange: function () {
    let {
      playMode,
      modeList
    } = this.data;
    playMode++;
    playMode = playMode > (modeList.length) ? 1 : playMode;
    app.globalData.playMode = playMode;
    this.setData({
      playMode
    });

    wx.showToast({
      title: modeList[playMode - 1].name,
      duration: 2000
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;

    this.setData({
      playing: app.globalData.playing,
      curPlayList: app.globalData.list_song,
      playMode: app.globalData.playMode
    });

    if ((!app.globalData.curPlaying.url) || (app.globalData.curPlaying.id != id)) {
      this.playMusic(id);
    } else {
      this.setData({
        music: app.globalData.curPlaying,
        duration: util.formatTime(app.globalData.curPlaying.dt),
        sliderMax: Math.floor(app.globalData.curPlaying.dt),
      });

      wx.setNavigationBarTitle({
        title: `${app.globalData.curPlaying.name}-${app.globalData.curPlaying.ar[0].name}`,
      });

      audio.getLyric(app.globalData.curPlaying.id, (data) => {
        this.setData({
          lyricsList: data
        })
      });
    }
  },

  playMusic: function (id) {
    let that = this;
    wx.request({
      url: baseUrl + 'song/detail?ids=' + id,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code === 200) {

          app.globalData.curPlaying = res.data.songs[0];
          if (!app.globalData.list_song.length) {
            app.globalData.list_song.push(res.data.songs[0]);
          }
          that.setData({
            music: res.data.songs[0],
            duration: util.formatTime(app.globalData.curPlaying.dt),
            sliderMax: Math.floor(app.globalData.curPlaying.dt)
          })

          // 获取歌曲url
          audio.getMusicUrl(app.globalData.curPlaying.id, (url) => {
            app.globalData.curPlaying.url = url;
            // 播放音乐
            app.playAudio(that);
          });

          // 设置标题
          wx.setNavigationBarTitle({
            title: `${app.globalData.curPlaying.name}-${app.globalData.curPlaying.ar[0].name}`,
          });

          //获取歌词
          // console.log("获取歌词")
          audio.getLyric(app.globalData.curPlaying.id, (data) => {
            // console.log("歌词：" + data)
            that.setData({
              lyricsList: data
            })
          });
        }
      }
    });
  },

  playStatusChange: function (e) {
    console.log(this.data);
    let {
      playing
    } = this.data;

    if (playing) {
      backgroundAudioManager.pause();
      playing = false;
    } else {
      backgroundAudioManager.play();
      playing = true;
    }

    app.globalData.playing = playing;
    this.setData({
      playing
    });
  },

  // 上、下一首
  playMusicChange: function (e) {
    //console.log(e);
    const value = parseInt(e.currentTarget.id);
    app.nextAudio(value, this);
  },

  //切换歌词页面
  playChange: function () {
    let showLyric = this.data.showLyric;
    this.setData({
      showLyric: !showLyric
    })
  },

  //进度条
  sliderChange: function (e) {
    const position = e.detail.value;
    app.seekAudio(position, this);
  },
  sliderMoveStart: function () {
    this.setData({
      isMovingSlider: true
    });
  },
  sliderMoveEnd: function () {
    this.setData({
      isMovingSlider: false
    });
  },

  //播放列表操作
  showPlayList: function () {
    this.drawer.showDrawer();
  },

  _cancelDrawer: function () {
    this.drawer.hideDrawer();
  },

  _confirmDrawer: function () {
    this.drawer.hideDrawer();
  },

  /**
   * 清空播放列表
   */
  deleteAll: function () {
    wx.showModal({
      title: "",
      content: "确定要清空播放列表?",
      success: (res) => {
        if (res.confirm) {
          app.globalData.list_song = [];
          app.globalData.index_song = 0;
          app.globalData.curPlaying = {};
          this.setData({
            curPlayList: []
          });
          backgroundAudioManager.stop();

          //清空播放栏
          WxNotificationCenter.postNotificationName('music', {
            playing: false,
            list_song: [],
            curPlaying: {}
          });
          wx.navigateBack();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 选取播放
   */
  selectedMusic: function (e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const id = parseInt(e.currentTarget.id);
    let {
      song_list,
      curPlaying,
      backgroundAudioManager
    } = app.globalData;

    if (id !== curPlaying.id) {
      app.globalData.index_song = index;
      this.playMusic(id);
    } else {
      const pauseStatus = backgroundAudioManager.paused; // 是否处于暂停状态
      if (pauseStatus) {
        backgroundAudioManager.play();
      }
    }
    this.drawer.hideDrawer();
  },

  delMusicByIndex: function (e) {
    const index = parseInt(e.currentTarget.dataset.index);
    var playIndex = app.globalData.index_song;

    let {
      list_song,
      index_song
    } = app.globalData;

    list_song.splice(index, 1);

    if (index_song == index)
      backgroundAudioManager.stop();

    index_song = index_song > index ? index_song - 1 : index_song;
    this.setData({
      curPlaying: list_song
    });

    if (list_song.length == 0) {
      app.globalData.list_song = [];
      app.globalData.index_song = 0;
      app.globalData.curPlaying = {};
      this.setData({
        curPlayList: []
      });
      backgroundAudioManager.stop();

      // 清空播放栏
      WxNotificationCenter.postNotificationName('music', {
        playing: false,
        list_song: [],
        curPlaying: {},
      });

      wx.navigateBack();
    } else {
      if (index == playIndex) {
        this.playMusic(list_song[index_song].id);
      }

      // 处理删除坐标问题（总坐标-1）
      if (index < playIndex) {
        app.globalData.index_song = playIndex - 1;
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.drawer = this.selectComponent('#drawer');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    backgroundAudioManager.onTimeUpdate(() => {
      let curLrcIndex = 0;
      if (this.data.showLyric) {
        for (let i in this.data.lyricsList.lrc) {
          const item = this.data.lyricsList.lrc[i];
          if (item.lrc_sec <= backgroundAudioManager.currentTime) {
            curLrcIndex = i;
          }
        }
      }

      this.setData({
        curLrcIndex,
        sliderValue: Math.floor(backgroundAudioManager.currentTime * 1000),
        currentTime: util.formatTime(Math.floor(backgroundAudioManager.currentTime * 1000))
      });
    });
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