// pages/room.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        gameName: "",
        roomNumber: "",
        players: [],
        avatarUrl: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(option) {
        var that = this;
        // console.log(option.gameId);

        // wx.getAccountInfoSync();
        // wx.login({
        //     success(res) {
        //         wx.request({
        //             url: 'https://api.weixin.qq.com/sns/jscode2session',
        //             data: {
        //                 appid: 
        //                 js_code: res.code
        //             },
        //             success(d) {
        //                 console.log(d);
        //             }
        //         })
        //     }
        // });

        // if (wx.getUserProfile) {
        //     this.setData({
        //         canIUseGetUserProfile: true
        //     })
        // }

        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        if (option.gameId) { // Create new room
            this.setData({
                gameId: option.gameId
            })
            db.collection("games").where({
                gameId: option.gameId
            }).get({
                success: function (result) {
                    // console.log(result);
                    if (result && result.data) {
                        that.setData({
                            gameName: result.data[0].gameName
                        })
                    }
                }
            });
        } else if (option.roomNumber) { // Enter existing room
            console.log(option.roomNumber);
            this.setData({
                roomNumber: option.roomNumber
            });

            // Get existing player list
            db.collection("rooms").where({
                roomNumber: option.roomNumber
            }).get({
                success: function (result) {
                    if (result && result.data) {
                        that.setData({
                            players: result.data[0].players
                        })
                    }
                },
                fail: function (e) {
                    console.log(e);
                }
            });
        }
    },

    onChooseAvatar(e) {
        var that = this;
        if (wx.getSystemInfoSync().SDKVersion < "2.27.1") {
            // PC debugging
            wx.getUserProfile({
                desc: '用于房间页面显示',
                success:(res) => {
                    this.setData({
                        avatarUrl: res.userInfo.avatarUrl,
                        players: that.data.players.concat({
                            avatarUrl: res.userInfo.avatarUrl
                        })
                    });
                    this.data.gameName ? this.createRoom() : this.enterRoom();
                },
                fail: (res) => {
                    console.log(res);
                }
            });
        } else {
            var currentPlayers = this.data.players.concat({
                avatarUrl: e.detail.avatarUrl
            })
            this.setData({
                avatarUrl: e.detail.avatarUrl,
                players: currentPlayers
            });
            this.data.gameName ? this.createRoom() : this.enterRoom();
        }

        // if (this.data.gameName) {
        //     // When room lead creates room
        //     this.createRoom();
        // } else {
        //     this.enterRoom();
        // }

        // this.data.gameName ? this.createRoom() : this.enterRoom();
    },

    // getUserProfile(e) {
    //     wx.getUserProfile({
    //         desc: '用于房间页面显示',
    //         success: (res) => {
    //             console.log(res.userInfo);
    //             this.setData({
    //                 userInfo: res.userInfo,
    //                 hasUserInfo: true,
    //                 players: [{
    //                     avatarUrl: res.userInfo.avatarUrl,
    //                     nickName: res.userInfo.nickName
    //                 }]
    //             });
    //             if (this.data.gameName) {
    //                 // When room lead creates room
    //                 this.createRoom();
    //             } else {
    //                 this.enterRoom();
    //             }
    //         }
    //     })
    // },

    generateRoomNumber() {

    },

    createRoom() {
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        const roomNumber = this.generateRoomNumber();

        db.collection('rooms').add({
            data: {
                "roomNumber": "0002",
                "gameName": this.data.gameName,
                "players": [],
                "roundTime": 30.0,
                "status": "InPreparation",
                "gameId": "countries",
                // "roomLeadName": this.data.userInfo.nickName,
                "roomLeadAvatar": this.data.avatarUrl,
                "totalTime": 900.0,
                "numberOfPlayers": 2.0,
                "startTime": new Date()
            },
            success: function (result) {
                console.log(result);
            },
            fail: function (result) {
                console.log(result);
            }
        });
    },

    enterRoom() {
        var that = this;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });

        // var existingPlayers = this.data.players;
        var currentPlayers = this.data.players
        // .concat({
        //     // "nickName": this.data.userInfo.nickName,
        //     "avatarUrl": this.data.avatarUrl
        // })

        try {
            db.collection('rooms').where({
                    roomNumber: this.data.roomNumber
                })
                .update({
                    data: {
                        players: currentPlayers
                    },
                    success: function (e) {
                        console.log(currentPlayers);
                        that.setData({
                            players: currentPlayers
                        });
                    },
                    fail: function (e) {
                        console.log(e);
                    }
                })
        } catch (e) {
            console.log(e);
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})