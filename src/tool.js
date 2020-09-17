function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

function successReturn(data) {
  return {
    type: 0,
    code: 200,
    msg: "ok",
    data,
  }
}

function failReturn(code, msg) {
  return {
    type: 1,
    code,
    msg,
  }
}

const getFromUsersRaw = (usersRaw) => {
  const users = usersRaw.map((userRaw) => {
    const { name, avatar, uid } = userRaw
    return {
      name,
      avatar,
      uid,
    }
  })
  const usersUids = users.map((user) => user.uid)
  return [users, usersUids]
}

const getFromChannelsRaw = (channelsRaw) => {
  const channels = channelsRaw.map((channelRaw) => {
    const {
      name,
      type: channelType,
      position,
      parentId,
      uid,
      guildId,
    } = channelRaw.dataValues
    return {
      name,
      channelType,
      position,
      uid,
      parentId,
      guildId,
      messageIds: [],
    }
  })
  const channelsUids = channels.map((channel) => channel.uid)

  return [channels, channelsUids]
}

module.exports = {
  uniqueArr,
  successReturn,
  failReturn,
  getFromUsersRaw,
  getFromChannelsRaw
}
