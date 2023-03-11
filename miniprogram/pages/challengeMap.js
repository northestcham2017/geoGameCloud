Page({
    data: {
        roomNumber: "",
        gameId: "",
        myIndex: 0,
        currentPlayerIndex: 0,
        userAnswer: "",
        players: [],
        roundTimeLimit: 30,
        roundTimeLimitInitial: 30,
        answers: []
    },

    onLoad: function (option) {
        var that = this;
        this._countdownTimeout = 0;
        this.setData({
            roomNumber: option.roomNumber,
            myIndex: parseInt(option.myIndex, 10)
        });
        // console.log(option.myIndex);

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
                        gameId: result.data[0].gameId,
                        roundTimeLimit: parseInt(result.data[0].roundTime, 10),
                        roundTimeLimitInitial: parseInt(result.data[0].roundTime, 10)
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
                                var iRoundTimeLimit = that.data.roundTimeLimit;
                                that.startCountdown(that, iRoundTimeLimit);

                                // Add watcher
                                that.watchPlayersUpdate(that);
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

    startCountdown(that, iCountdown) {
        that._countdownTimeout = setTimeout(function() {
            var iRoundTimeLimit = iCountdown - 1;
            var bIsCurrentPlayer = that.data.currentPlayerIndex === that.data.myIndex ? true : false;
            if (iRoundTimeLimit === 0) {
                if (bIsCurrentPlayer) {
                    wx.showToast({
                        title: '时间到！',
                        icon: "none"
                    });
                }
                var iMyIndex = that.data.myIndex;
                var iCurrentPlayerIndex = that.data.currentPlayerIndex;
                var aPlayers = that.data.players;
                var iNextPlayerIndex = (iCurrentPlayerIndex === aPlayers.length - 1) ? 0 : iCurrentPlayerIndex + 1;
                // console.log("next player index:" + iNextPlayerIndex);
                that.setData({
                    currentPlayerIndex: iNextPlayerIndex
                    // roundTimeLimit: that.data.roundTimeLimitInitial
                });
                that.switchPlayer(that);
            } else {
                that.setData({
                    roundTimeLimit: iRoundTimeLimit
                });
                that.startCountdown(that, iRoundTimeLimit);
            }
        }, 1000);
    },

    watchPlayersUpdate(that) {
        // var that = this;
        var sRoomNumber = that.data.roomNumber;
        // console.log("sRoomNumber:" + sRoomNumber);
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        db.collection('rooms')
            .where({
                roomNumber: sRoomNumber
            })
            .watch({
                onChange: function (snapshot) {
                    // console.log(snapshot.docs[0]);
                    that.setData({
                        currentPlayerIndex: snapshot.docs[0].currentPlayerIndex,
                        players: snapshot.docs[0].players,
                        roundTimeLimit: snapshot.docs[0].roundTime
                    });
                    clearTimeout(that._countdownTimeout);
                    that.startCountdown(that, parseInt(snapshot.docs[0].roundTime, 10));
                    // console.log(snapshot.docs[0].currentPlayerIndex);
                },
                onError: function (err) {
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

        var i, bFlag = false;
        for (i = 0; i < aAnswers.length; i++) {
            if (aAnswers[i] === sAnswer) {
                wx.showToast({
                    title: "回答正确！"
                });
                bFlag = true;
                var iNextPlayerIndex = (iCurrentPlayerIndex === aPlayers.length - 1) ? 0 : iCurrentPlayerIndex + 1;
                // console.log(iNextPlayerIndex);
                that.setData({
                    userAnswer: "",
                    currentPlayerIndex: iNextPlayerIndex
                });

                // Update answered answers for current player
                aPlayers[iMyIndex].answered.push(sAnswer);
                that.setData({
                    players: aPlayers
                });
                that.switchPlayer(that);
            }
        }
        if (bFlag === false) {
            wx.showToast({
                title: "不对哦"
            });
        }
    },

    switchPlayer(that) {
        var sRoomNumber = that.data.roomNumber;
        var aPlayers = that.data.players;
        var iCurrentPlayerIndex = that.data.currentPlayerIndex;
        var iRoundTimeLimitInitial = that.data.roundTimeLimitInitial;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
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
                    that.setData({
                        roundTimeLimit: iRoundTimeLimitInitial
                    });
                }
            });
    }
});