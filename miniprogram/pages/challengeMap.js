Page({
    data: {
        roomNumber: "",
        gameId: "",
        myIndex: 0,
        currentPlayerIndex: 0,
        userAnswer: "",
        players: [],
        answers: []
    },

    onLoad: function (option) {
        var that = this;
        this.setData({
            roomNumber: option.roomNumber,
            myIndex: parseInt(option.myIndex, 10)
        });
        console.log(option.myIndex);

        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });

        // Get player list
        db.collection("rooms").where({
            roomNumber: option.roomNumber
        }).get({
            success: function (result) {
                if (result && result.data) {
                    that.setData({
                        players: result.data[0].players,
                        gameName: result.data[0].gameName,
                        gameId: result.data[0].gameId
                        // gameCategory: result.data[0].gameCategory
                    });

                    // Get answers
                    db.collection('games').where({
                        gameId: result.data[0].gameId
                    }).get({
                        success: function (result) {
                            if (result.data && result.data[0] && result.data[0].answer.length > 0) {
                                that.setData({
                                    answers: result.data[0].answer
                                });

                                // Add watcher
                                that.watchPlayersUpdate();
                            }
                        }
                    });
                }
            },
            fail: function (e) {
                console.log(e);
            }
        });

    },

    watchPlayersUpdate() {
        var that = this;
        var sRoomNumber = this.data.roomNumber;
        console.log("sRoomNumber:" + sRoomNumber);
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        db.collection('rooms')
        .where({
          roomNumber: sRoomNumber
        })
        .watch({
          onChange: function(snapshot) {
              console.log(snapshot.docs[0]);
              that.setData({
                currentPlayerIndex: snapshot.docs[0].currentPlayerIndex,
                players: snapshot.docs[0].players
              });
          },    
          onError: function(err) {
            console.error('the watch closed because of error', err)
          }
        });
    },

    onAnswerInput(e) {
        this.setData({
            userAnswer: e.detail.value
        });
    },

    onConfirmPress() {
        var that = this;
        var sAnswer = this.data.userAnswer;
        var sRoomNumber = this.data.roomNumber;
        var iMyIndex = this.data.myIndex;
        var aAnswers = this.data.answers;
        var aPlayers = this.data.players;
        var iCurrentPlayerIndex = this.data.currentPlayerIndex;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });

        var i, bFlag = false;
        for (i = 0; i < aAnswers.length; i++) {
            if (aAnswers[i] === sAnswer) {
                wx.showToast({
                    title: "回答正确！"
                });
                bFlag = true;
                iCurrentPlayerIndex = (iMyIndex === aPlayers.length - 1) ? 0 : iMyIndex + 1;
                console.log("iCurrentPlayerIndex:" + iCurrentPlayerIndex);
                that.setData({
                    userAnswer: "",
                    currentPlayerIndex: iCurrentPlayerIndex
                });

                // Update answered answers for current player
                aPlayers[iMyIndex].answered.push(sAnswer);
                this.setData({
                    players: aPlayers
                });
                db.collection('rooms').where({
                        roomNumber: sRoomNumber
                    })
                    .update({
                        data: {
                            players: aPlayers,
                            currentPlayerIndex: iCurrentPlayerIndex
                        },
                        success: function (e) {
                            console.log(e);
                        }
                    });
            }
        }
        if (bFlag === false) {
            wx.showToast({
                title: "不对哦"
            });
        }
    }
});