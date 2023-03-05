Page({
    data: {
        roomNumber: ""
    },

    onLoad: function () {
        // var that = this;
        // const db = wx.cloud.database({
        // });
        // db.collection("games").get({
        //     success: function(result) {
        //         if (result && result.data) {
        //             that.setData({
        //                 gameList: result.data
        //             })
        //         }
        //     }
        // })
    },

    onRoomNumberInput(e) {
        this.setData({
            roomNumber: e.detail.value
        })
    },

    onConfirmPress() {
        var roomNumber = this.data.roomNumber;
        const db = wx.cloud.database({
            envId: "cloud1-8g7is2ox21d31413"
        });
        db.collection('rooms').where({
            roomNumber: roomNumber
        }).get({
            success: function (result) {
                if (result.data.length > 0) {
                    wx.navigateTo({
                        url: "room?roomNumber=" + roomNumber,
                        success: function (res) {}
                    });
                } else {
                    wx.showToast({
                        title: "房间不存在"
                    })
                }
            }
        });
    }
});