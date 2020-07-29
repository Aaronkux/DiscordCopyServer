const { InviteLink, Guild, User } = require("../models/test")
const {
  successReturn,
  failReturn,
  getFromUsersRaw,
  getFromChannelsRaw,
} = require("../tool")

const create_link = async (ctx, next) => {
  const { guildId, userId, slots } = ctx.request.body
  const guild = await Guild.findOne({
    where: {
      uid: guildId,
    },
  })
  const shortid = require("shortid")
  let linkCode, isExist
  while (isExist !== null) {
    linkCode = shortid.generate()
    isExist = await InviteLink.findOne({
      where: {
        link: linkCode,
      },
    })
  }
  console.log("valid link generated")

  const newLink = await InviteLink.create({
    userId,
    slots,
    link: linkCode,
  })
  guild.addInvitelinks(newLink)

  const data = {
    link: linkCode,
    userId,
    slots,
  }
  ctx.response.body = JSON.stringify(successReturn(data))
}

const join_link = async (ctx, next) => {
  const { userId, linkCode } = ctx.request.body
  const link = await InviteLink.findOne({
    where: {
      link: linkCode,
    },
  })
  if (!link || link.dataValues.slots < 1) {
    ctx.response.body = JSON.stringify(failReturn(404, `linkCode invalid`))
    return
  }
  const guild = await link.getGuild()
  const user = await User.findOne({
    where: {
      uid: userId,
    },
  })
  if (!user) {
    ctx.response.body = JSON.stringify(failReturn(404, `user not find`))
    return
  }
  user.addGuilds(guild)
  guild.addUsers(user)

  link.slots -= 1
  await link.save()

  let data = {
    guilds: [],
    channels: [],
    users: [],
  }

  const { name, uid, avatar, changeTime, owner } = guild
  const usersRaw = await guild.getUsers()
  const [users, usersUids] = getFromUsersRaw(usersRaw)

  const channelsRaw = await guild.getChannels()
  const [channels, channelsUids] = getFromChannelsRaw(channelsRaw)

  data.users = users
  data.channels = channels
  data.guilds.push({
    name,
    owner,
    uid,
    avatar,
    changeTime,
    channelsUids,
    usersUids,
  })
  ctx.response.body = JSON.stringify(successReturn(data))
}

module.exports = {
  "POST /invite": create_link,
  "POST /joinLink": join_link,
}
