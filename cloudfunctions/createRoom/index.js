// const cloud = require('wx-server-sdk')
// cloud.init({
//   env: cloud.DYNAMIC_CURRENT_ENV
// })
// const db = cloud.database({
//     envId: "cloud1-8g7is2ox21d31413"
// })
// exports.main = async (event, context) => {
//     console.log(event);
//     console.log(context);
//   try {
//     return await db.collection('rooms').add({
//         data: {
//             "gameName": event.gameName,
//             "playerIds": event.playerIds,
//             "roundTime": event.roundTime,
//             "status": event.status,
//             "gameId": event.gameId,
//             "roomLeadId": event.roomLeadId,
//             "totalTime": event.totalTime,
//             "numberOfPlayers": event.numberOfPlayers,
//             "startTime": event.startTime
//         },
//     })
//   } catch(e) {
//     console.error(e)
//   }
// }