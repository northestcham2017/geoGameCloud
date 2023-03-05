// index.js
// const app = getApp()
const { envList } = require('../envList.js');

Page({
  data: {
    showUploadTip: false,
    gameList: [],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: false
  },

  onLoad: function () {
    var that = this;
    const db = wx.cloud.database({
    });
    db.collection("games").get({
        success: function(result) {
            if (result && result.data) {
                that.setData({
                    gameList: result.data
                })
            }
        }
    })
  },

  onGamePress(e) {
    const gameId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "room?gameId=" + gameId,
      success: function(res) {
        // res.eventChannel.emit('gameId', { data: gameId });
      }
    });
  },

  onSearchRoomPress(e) {
    // wx.showModal({
    //     title: "请输入房间号",
    //     content
    // });
    wx.navigateTo({
        url: "searchRoom",
        success: function(res) {
        //   res.eventChannel.emit('gameId', { data: gameId });
        }
      });
  }

});

