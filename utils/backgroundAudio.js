const api = require('api.js');
const util = require('util.js');
/**
 * 获取歌曲url
 */
const getMusicUrl = (id, sueecss, fail, cb) => {
    wx.request({
        url: api + 'song/url',
        data: {
            id,
            br: 128000
        },
        success: (res) => {
            if (res.data.code === 200) {
                const data = res.data.data[0];
                if (!data.url) { // 没有歌曲url， 自动播放下一首
                    fail && fail();
                } else {
                    sueecss && sueecss(data.url);
                }
            }
        }
    })
}

/**
 * 获取歌曲评论
 */
const getComments = (query, cb) => {
    wx.request({
        url: api + 'comment/music',
        data: query,
        success: (res) => {
            if (res.data.code === 200) {
                cb && cb(res.data);
            }
        }
    })
}

const getLyric = (id, sueecss, fail, cb) => {
    wx.request({
        url: api + 'lyric',
        data: {
            id,
        },
        success: (res) => {
            if (res.data.code === 200) {
                var lrc = util.parse_lrc(res.data.lrc && res.data.lrc.lyric ? res.data.lrc.lyric : '');
                res.data.lrc = lrc.now_lrc;
                res.data.scroll = lrc.scroll ? 1 : 0
                sueecss && sueecss(res.data);
            }
        }
    })
}

module.exports = {
    getMusicUrl: getMusicUrl,
    getComments: getComments,
    getLyric: getLyric
}