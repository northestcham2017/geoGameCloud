// pages/room.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bRoomOwner: null,
        gameName: "",
        gameId: "",
        gameCategory: "",
        roomNumber: "",
        players: [],
        myIndex: 0,
        avatarUrl: "",
        roundTimeLimitOptions: [10, 20, 30, 60],
        roundTimeLimit: 30
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
        var bRoomOwner = option.gameId ? true : false;
        this.setData({
            bRoomOwner: bRoomOwner
        });

        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        if (bRoomOwner) { // Create new room
            this.setData({
                gameId: option.gameId
            })
            db.collection("games").where({
                gameId: option.gameId
            }).get({
                success: function (result) {
                    if (result && result.data) {
                        that.setData({
                            gameName: result.data[0].gameName,
                            gameCategory: result.data[0].gameCategory
                        })
                    }
                }
            });
        } else if (option.roomNumber) { // Enter existing room
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
                            players: result.data[0].players,
                            gameName: result.data[0].gameName,
                            gameCategory: result.data[0].gameCategory,
                            roundTimeLimit: result.data[0].roundTime
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
                success: (res) => {
                    that.setData({
                        avatarUrl: res.userInfo.avatarUrl,
                        myIndex: that.data.players.length,
                        players: that.data.players.concat({
                            avatarUrl: res.userInfo.avatarUrl,
                            answered: []
                        })
                    });

                    // wx.cloud.uploadFile({
                    //     cloudPath: "avatar.jpg",
                    //     filePath: res.userInfo.avatarUrl,
                    //     success: res => {
                    //         console.log(res);
                    //     },
                    //     fail: err => {
                    //         console.log(err);
                    //     }
                    // });
                    this.data.bRoomOwner ? this.createRoom() : this.enterRoom();
                },
                fail: (res) => {
                    console.log(res);
                }
            });
        } else {
            // Real device
            if (e.detail.avatarUrl) {
                wx.cloud.uploadFile({
                    cloudPath: Math.random() + ".jpg",
                    filePath: e.detail.avatarUrl,
                    success: res => {
                        // Initial user data
                        var newUser = {
                            avatarUrl: res.fileID,
                            answered: []
                        };

                        var currentPlayers = that.data.players.concat(newUser);
                        that.setData({
                            avatarUrl: res.fileID,
                            players: currentPlayers,
                            myIndex: currentPlayers.length - 1
                        });
                        that.data.bRoomOwner ? that.createRoom() : that.enterRoom();
                    },
                    fail: err => {
                        console.log(err);
                    }
                });
            }
        }
    },

    onStartPress() {
        var sRoomNumber = this.data.roomNumber;

        var that = this;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        db.collection('rooms').where({
            roomNumber: this.data.roomNumber
        })
        .update({
            data: {
                status: "Started"
            },
            success: function (e) {
                console.log(e);
                // that.setData({
                //     players: currentPlayers
                // });
                // that.watchPlayersUpdate();
            },
            fail: function (e) {
                console.log(e);
            }
        })
    },

    watchPlayersUpdate() {
        var that = this;
        // var bRoomOwner = this.data.bRoomOwner;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        const watcher = db.collection('rooms')
          .where({
            roomNumber: this.data.roomNumber
          })
          .watch({
            onChange: function(snapshot) {
                that.setData({
                    players: snapshot.docs[0].players
                });
                if (snapshot.docs[0].status === "Started") {
                    var sGameCategory = that.data.gameCategory;
                    switch(sGameCategory) {
                        case "map": 
                            wx.navigateTo({
                                url: "challengeMap?roomNumber=" + that.data.roomNumber + "&myIndex=" + that.data.myIndex
                            });
                            watcher.close();
                            break;
                        default:
                            break;
                    }
                }
            },
            onError: function(err) {
              console.error('the watch closed because of error', err)
            }
          })
    },

    generateRoomNumber(result) {
        var i, bExisted = false;
        var randomRoomNumber = Math.floor(Math.random() * 10000).toString()
        for (i = 0; i < result.data.length; i++) {
            if (randomRoomNumber === parseInt(result.data[i].roomNumber)) {
                bExisted = true;
                break;
            }
        }
        if (!bExisted) {
            return randomRoomNumber;
        } else {
            generateRoomNumber(result);
        }
    },

    createRoom() {
        var that = this;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });

        db.collection("rooms").get({
            success: function (result) {
                console.log(result);
                var newRoomNumber = that.generateRoomNumber(result);
                db.collection('rooms').add({
                    data: {
                        "roomNumber": newRoomNumber.toString(),
                        "gameName": that.data.gameName,
                        "currentPlayerIndex": 0,
                        "players": [{
                            avatarUrl: that.data.avatarUrl,
                            answered: []
                        }],
                        "roundTime": 30.0,
                        "status": "InPreparation",
                        "gameId": "countries",
                        "gameCategory": that.data.gameCategory,
                        // "roomLeadName": this.data.userInfo.nickName,
                        "roomLeadAvatar": that.data.avatarUrl,
                        "totalTime": 900.0,
                        "numberOfPlayers": 2.0,
                        "startTime": new Date()
                    },
                    success: function (result) {
                        that.setData({
                            roomNumber: newRoomNumber
                        });
                        that.watchPlayersUpdate();
                    },
                    fail: function (result) {
                        console.log(result);
                    }
                });
            }
        });
    },

    enterRoom() {
        var that = this;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });

        var currentPlayers = this.data.players

        try {
            db.collection('rooms').where({
                    roomNumber: this.data.roomNumber
                })
                .update({
                    data: {
                        players: currentPlayers
                    },
                    success: function (e) {
                        that.setData({
                            players: currentPlayers
                        });
                        that.watchPlayersUpdate();
                    },
                    fail: function (e) {
                        console.log(e);
                    }
                });
        } catch (e) {
            console.log(e);
        }
    },

    bindRoundTimeChange(e) {
        var that = this;
        var iIndex = e.detail.value;
        var roundTimeLimitOptions = this.data.roundTimeLimitOptions;

        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        db.collection('rooms').where({
                roomNumber: that.data.roomNumber
            })
            .update({
                data: {
                    roundTime: parseInt(roundTimeLimitOptions[iIndex], 10)
                },
                success: function (e) {
                    that.setData({
                        roundTimeLimit: roundTimeLimitOptions[iIndex]
                    });
                },
                fail: function (e) {
                    console.log(e);
                }
            });
    }
})