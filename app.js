//app.js
const util = require('utils/util.js');
const audio = require('utils/backgroundAudio.js');
const WxNotificationCenter = require('utils/WxNotificationCenter.js')

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  playAudio: function (that) {
    const {
      curPlaying,
      backgroundAudioManager
    } = this.globalData;

    backgroundAudioManager.title = curPlaying.name;
    backgroundAudioManager.singer = curPlaying.ar[0].name;
    backgroundAudioManager.coverImgUrl = curPlaying.al.picUrl;
    backgroundAudioManager.src = curPlaying.url;

    //监听背景音频进入可播放状态事件。 但不保证后面可以流畅播放
    backgroundAudioManager.onCanplay(() => {
      backgroundAudioManager.play();
    });

    //监听背景音频播放事件
    backgroundAudioManager.onPlay(() => {
      this.globalData.playing = true;
      that.setData({
        playing: true
      });
      WxNotificationCenter.postNotificationName('music', {
        playing: true,
        list_song: this.globalData.list_song,
        curPlaying: this.globalData.curPlaying
      });
    });

    backgroundAudioManager.onPause(() => {
      this.globalData.playing = false;
      that.setData({
        playing: false
      });

      WxNotificationCenter.postNotificationName('music', {
        playing: false,
        list_song: this.globalData.list_song,
        curPlaying: this.globalData.curPlaying
      });

      var thats = this;
      wx.getBackgroundAudioPlayerState({
        complete: (res) => {
          thats.globalData.currentPosition = res.currentPosition ? res.currentPosition:0;
        }
      })
    });

    backgroundAudioManager.onStop(()=>{
      this.globalData.playing = false;
      that.setData({
        playing : false
      });
    });

    backgroundAudioManager.onEnded(()=>{
      const{
        playMode,
        curPlaying
      } = this.globalData;

      this.globalData.playing = false;
      that.setData({
        playing : false
      });
      if(playMode == 2){
        this.seekAudio(0,that,()=>{
          this.playAudio(that);
        });
      }
      else{
        this.nextAudio(1,that);
      }
    });

    backgroundAudioManager.onPrev(()=>{
      this.globalData.playing = false;
      that.setData({
        playing : false
      });
      this.nextAudio(-1,that);
    });

    backgroundAudioManager.onNext(()=>{
      this.globalData.playing = false;
      that.setData({
        playing : false
      });
      this.nextAudio(1,that);
    });

    backgroundAudioManager.onError((err)=>this.nextAudio(1,that));
  },

  nextAudio : function(value,that){
    const{
      playMode,
      list_song,
      curPlaying
    } = this.globalData;
    let playIndex = 0;
    if(playMode == 3){
      playIndex = Math.floor(Math.random()*list_song.length);
    }
    else{
      for(let[index,item] of list_song.entries()){
        if(item.id == curPlaying.id){
          playIndex = index;
        }
      }
      playIndex += value;
      if(playIndex >=list_song.length-1){
        playIndex = 0;
      }
      else if(playIndex < 0){
        playIndex = list_song.length-1;
      }
    }

    this.globalData.curPlaying = list_song[playIndex];
    this.globalData.index_song = playIndex;

    audio.getMusicUrl(this.globalData.curPlaying.id,(url)=>{
      this.globalData.curPlaying.url = url;
      this.updateNewAudio(that);
      this.playAudio(that);
    },()=>this.nextAudio(1,that));
  },

  updateNewAudio:function(that){
    if (that.data.music.id === this.globalData.curPlaying.id) {
      return;
    }

    // 更新歌词
    audio.getLyric(this.globalData.curPlaying.id, (data) => {
      // console.log("歌词：" + data)
      that.setData({
        lyricsList: data
      })
    });

    that.setData({
      music: this.globalData.curPlaying,
      duration: util.formatTime(this.globalData.curPlaying.dt),
      sliderMax: Math.floor(this.globalData.curPlaying.dt),
    });

    wx.setNavigationBarTitle({
      title: `${this.globalData.curPlaying.name}-${this.globalData.curPlaying.ar[0].name}`,
    })
  },

  seekAudio: function (position, that, cb) {
    const {
      backgroundAudioManager
    } = this.globalData;

    const pauseStatus = this.globalData.backgroundAudioManager.paused;

    if (pauseStatus) {
      backgroundAudioManager.play();
    }

    wx.seekBackgroundAudio({
      position: Math.floor(position / 1000), // 单位秒【此处的position是毫秒】
      success: function () {
        that.setData({
          currentTime: util.formatTime(position),
          sliderValue: position,
        });

        if (pauseStatus) {
          backgroundAudioManager.play();
        }

        cb && cb();
      }
    })
  },


  globalData: {
    list_song: [], // 歌曲播放列表
    index_song: 0, // 当前播放歌曲在播放列表中的index
    curPlaying: {}, // 当前播放歌曲
    currentTime: '00:00', // 当前歌曲播放到什么时间
    playMode: 1, // 播放类型 【1 列表循环  2 单曲循环  3 随机播放】
    playing: false, // 是否正在播放
    currentPosition: 0, // 记录播放位置
    backgroundAudioManager: wx.getBackgroundAudioManager(),
  }
})