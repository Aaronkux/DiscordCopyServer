let online_users = new Set()
let guilds_users_online = {}
let guilds_users_position = {}

const diffData = (oldData, newData) => {
  let needJoin, needLeave
  if (oldData.guildId !== newData.guildId) {
    needJoin = [newData.guildId]
    needLeave = oldData.channelIds
  } else {
    const allChannelIdss = Array.from(
      new Set([...oldData.channelIds, ...newData.channelIds])
    )
    needLeave = allChannelIdss.filter((id) => !newData.channelIds.includes(id))
    needJoin = allChannelIdss.filter((id) => !oldData.channelIds.includes(id))
  }
  return [needJoin, needLeave]
}

module.exports = (io) => {
  io.on("connection", (socket) => {
    //base information
    socket.on("baseInfo", (userId) => {
      //add user online
      online_users.add(userId)
      //userId添加到socket
      socket.userId = userId
      // console.log('online_user', online_users)

      //add userId to all guild that user belongs
      const { User } = require("./models/test")
      User.findOne({
        where: {
          uid: userId,
        },
      })
        .then((user) => user.getGuilds())
        .then((guilds) => guilds.map((guild) => guild.dataValues.uid))
        .then((guildIds) => {
          //add userId to guilds_users_online
          guildIds.forEach((guildId) => {
            if (!guilds_users_online[guildId]) {
              guilds_users_online[guildId] = []
            }
            if (!guilds_users_online[guildId].includes(userId)) {
              guilds_users_online[guildId].push(userId)
              io.in(guildId).emit(
                "guildUserOnline",
                JSON.stringify(guilds_users_online[guildId]),
                guildId
              )
            }
          })
          console.log(guilds_users_online)
          // add guildIds to scoket.guildIds
          socket.guildIds = guildIds
        })
      // const guilds = user.getGuilds()
      // console.log(guilds)
    })

    //join room
    socket.on("joinChannel", (data) => {
      console.log(data)
      let needJoin, needLeave
      if (socket.data) {
        //socket.data exist
        ;[needJoin, needLeave] = diffData(socket.data, data)
      } else {
        //first time join
        needJoin = [data.guildId]
        needLeave = []
      }
      //set socket.data
      socket.data = data
      //join channels
      socket.join(needJoin, () => {
        console.log(`${socket.userId} join channels ${needJoin}`)
      })
      //leave channels
      needLeave.forEach((channelId) => {
        socket.leave(channelId)
      })
      console.log(`${socket.userId} leave channels ${needLeave}`)

      //exit old channel

      if (socket.currentChannelId) {
        let oldChannelIds =
          guilds_users_position[socket.currentGuildId][socket.currentChannelId]
        const index = oldChannelIds.indexOf(socket.userId)
        if (index > -1) {
          oldChannelIds.splice(index, 1)
          if (oldChannelIds.length === 0) {
            delete guilds_users_position[socket.currentGuildId][
              socket.currentChannelId
            ]
          }
        }
        socket.currentChannelId = null
      }

      socket.currentGuildId = data.guildId

      if (!guilds_users_position[data.guildId]) {
        guilds_users_position[data.guildId] = {}
      }

      //current channel, channelId | null
      const current = data.current
      if (current) {
        //update guild-channel-user information
        guilds_users_position[data.guildId][current]
          ? guilds_users_position[data.guildId][current].push(socket.userId)
          : (guilds_users_position[data.guildId][current] = [socket.userId])

        socket.currentChannelId = current
      } else {
        //tell everyone in guild room your position
        socket.emit(
          "guildUserOnline",
          JSON.stringify(guilds_users_online[data.guildId]),
          data.guildId
        )
      }
      //tell everyone in guild room position
      console.log("guilds_users_position", guilds_users_position)
      io.in(data.guildId).emit(
        "usersPositionInGuild",
        JSON.stringify(guilds_users_position[data.guildId])
      )

      // if (current)
      // console.log(guilds_users_position)
      //tell everyone in guild room online users
      //1.client send all users belongs to guild to server
      //2.server check the online list and pick the online user
      //3.emit to user who is online
      //4.create a array to as client's subscribe users online state,
      //5.
    })

    socket.on("disconnect", () => {
      online_users.delete(socket.userId)
      console.log("hh", socket.rooms)
      // console.log('online_user', online_users)
      // exit position
      if (socket.currentChannelId) {
        let oldChannelIds =
          guilds_users_position[socket.currentGuildId][socket.currentChannelId]
        const index = oldChannelIds.indexOf(socket.userId)
        if (index > -1) {
          oldChannelIds.splice(index, 1)
          if (oldChannelIds.length === 0) {
            delete guilds_users_position[socket.currentGuildId][
              socket.currentChannelId
            ]
          }
        }
        //tell everyone in guild room position
        console.log(guilds_users_position)
        io.in(socket.currentGuildId).emit(
          "usersPositionInGuild",
          JSON.stringify(guilds_users_position[socket.currentGuildId])
        )
      }
      //update online users information
      if (socket.guildIds) {
        socket.guildIds.forEach((guildId) => {
          guilds_users_online[guildId].splice(
            guilds_users_online[guildId].indexOf(socket.userId),
            1
          )
          io.in(guildId).emit(
            "guildUserOnline",
            JSON.stringify(guilds_users_online[guildId]),
            guildId
          )
        })
      }
      console.log(guilds_users_online)
    })
  })
}
