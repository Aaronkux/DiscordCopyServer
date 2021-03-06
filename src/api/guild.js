const { User, Guild } = require("../models/test")
const multer = require("@koa/multer")
const { successReturn, getFromUsersRaw, getFromChannelsRaw } = require("../tool")

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./src/public/uploads")
  },
  filename: function (req, file, cb) {
    // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
    cb(null, `avatar_${Date.now()}.${file.originalname.split(".")[1]}`)
  },
})

const upload = multer({ storage: storage }).single("file")

const get_guild_flow = async (ctx, next) => {
  const userUid = ctx.request.query.userUid
  let ret
  if (userUid) {
    ret = await get_all_guild(ctx, next)
  } else {
    ret = await get_guild(ctx, next)
  }
  ctx.response.body = JSON.stringify(ret)
}

const get_all_guild = async (ctx, next) => {
  const userUid = ctx.request.query.userUid
  const user = await User.findOne({
    where: {
      uid: userUid,
    },
  })
  const guilds = await user.getGuilds()
  let data = {
    guilds: [],
    channels: [],
    users: [],
  }
  //info.user 去重
  let addedUser = new Set()
  //循环遍历guilds
  for (let guild of guilds) {
    const { name, uid, avatar, changeTime, owner } = guild.dataValues
    //获取当前工会所有会员
    const usersRaw = await guild.getUsers()
    const [users, usersUids] = getFromUsersRaw(usersRaw)
    for (let user of users) {
      if (!addedUser.has(user.uid)) {
        addedUser.add(user.uid)
        data.users.push(user)
      }
    }

    //获取当前工会所有channel
    const channelsRaw = await guild.getChannels()
    const [channels, channelsUids] = getFromChannelsRaw(channelsRaw)

    data.guilds.push({
      name,
      owner,
      uid,
      avatar,
      changeTime,
      channelsUids,
      usersUids,
    })
    data.channels = data.channels.concat(channels)
  }

  return successReturn(data)
}

const get_guild = async (ctx, next) => {
  const guildUid = ctx.request.query.guildUid
  const localChangeTime = ctx.request.query.localChangeTime
  const guild = await Guild.findOne({
    where: {
      uid: guildUid,
    },
  })
  const { changeTime } = guild.dataValues

  let data = {
    guilds: [],
    channels: [],
    users: [],
  }
  if (changeTime !== localChangeTime) {
    const { name, uid, avatar, changeTime, owner } = guild.dataValues
    //获取当前工会所有会员
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
  }

  return successReturn(data)
}

const create_guild = async (ctx, next) => {
  try {
    const { name, userId } = ctx.request.body
    const file = ctx.request.file
    const avatar = file
      ? `/public/uploads/${file.filename}`
      : "https://cdn.discordapp.com/icons/442204458961862657/1dcae90ab46927ffaeb6956b897e4efc.png?size=128"
    const user = await User.findOne({
      where: {
        uid: userId,
      },
    })
    const guild = await Guild.create({
      name,
      owner: userId,
      avatar,
      uid: Number(Date.now().toString().slice(4)),
      changeTime: Date.now().toString(),
    })
    await user.addGuilds(guild)
    await guild.addUsers(user)
    const guilds = [
      {
        name,
        owner: userId,
        uid: guild.dataValues.uid,
        avatar: avatar,
        changeTime: guild.dataValues.changeTime,
        channelsUids: [],
        usersUids: [Number(userId)],
      },
    ]
    let data = {}
    data.guilds = guilds
    data.users = [
      {
        name: user.dataValues.name,
        avatar: user.dataValues.avatar,
        uid: user.dataValues.uid,
      },
    ]
    ctx.response.body = JSON.stringify(successReturn(data))
  } catch (error) {
    console.log(error)
  }
}

const update_guild = async (ctx, next) => {
  const { name, guildId } = ctx.request.body
  let updateData = {
    name,
    changeTime: Date.now().toString(),
  }
  if (ctx.request.file) {
    updateData["avatar"] = `/public/uploads/${ctx.request.file.filename}`
    const guild = await Guild.findOne({
      where: {
        uid: guildId,
      },
      attributes: ["avatar"],
    })
    const oldAvatarPath = guild.dataValues.avatar
    if (!oldAvatarPath.startsWith("https")) {
      const fs = require("fs")
      const path = require("path")
      fs.unlink(path.join(__dirname, `..${oldAvatarPath}`), (err) => {
        if (err) throw err
        console.log("path/file.txt was deleted")
      })
    }
  }
  await Guild.update(updateData, {
    where: {
      uid: guildId,
    },
  })
  const newGuild = await Guild.findOne({
    where: {
      uid: guildId,
    },
  })
  const { avatar, changeTime } = newGuild.dataValues
  const data = {
    name,
    changeTime,
    uid: guildId,
    avatar,
  }
  ctx.response.body = JSON.stringify(successReturn(data))
}

module.exports = {
  "GET /guild": get_guild_flow,
  "POST /guild": {
    middleware: upload,
    callback: create_guild,
  },
  "PATCH /guild": {
    middleware: upload,
    callback: update_guild,
  },
}
