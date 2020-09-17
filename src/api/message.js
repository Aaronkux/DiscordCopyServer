const { Message, User, Channel } = require("../models/test")
const jsonwebtoken = require("jsonwebtoken")
const moment = require("moment")
const Sequelize = require("sequelize")

const get_message = async (ctx, next) => {
  const channelId = ctx.request.query.channelId
  // for old fetch
  const offset = Number(ctx.request.query.offset) || 0
  // for newest fetch
  const lastMessageId = ctx.request.query.lastMessageId
    ? Number(ctx.request.query.lastMessageId)
    : null
  // for limit
  const limit = lastMessageId ? 9999 : Number(ctx.request.query.limit) || 50

  const token = ctx.header.authorization.split(" ")[1]
  const decode = jsonwebtoken.verify(token, "hahaha")

  //有lastMessageId，获取lastMessageId后的新数据，没有则返回空data
  let lastMsgCreatedAt = 0
  if (lastMessageId) {
    const lastMsg = await Message.findOne({
      where: {
        uid: lastMessageId,
      },
      attributes: ["createdAt"],
    })
    lastMsgCreatedAt = lastMsg.dataValues.createdAt
  }

  //查找到用户 验证用户是否有权访问此channel下的msg
  const { uid: userId } = decode
  const user = await User.findOne({
    where: {
      uid: userId,
    },
  })

  const channel = await Channel.findOne({
    where: {
      uid: channelId,
    },
  })
  const guilds = await user.getGuilds()
  const currentGuild = await channel.getGuild()
  let ret
  if (
    guilds
      .map((guild) => guild.dataValues.uid)
      .includes(currentGuild.dataValues.uid)
  ) {
    const rawMessages = await Message.findAll({
      where: {
        parentId: channelId,
        createdAt: {
          [Sequelize.Op.gt]: lastMsgCreatedAt,
        },
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })
    const data = rawMessages.map((rawMessage) => {
      const { content, owner, parentId, uid, createdAt } = rawMessage.dataValues
      return {
        content,
        owner,
        parentId,
        uid,
        createdAt,
      }
    })
    ret = {
      type: 0,
      code: 200,
      msg: "ok",
      data,
    }
  } else {
    ret = {
      type: 1,
      code: 403,
      msg: "no right to access",
    }
  }
  ctx.response.body = JSON.stringify(ret)
}

const create_message = async (ctx, next) => {
  const { content, userId, parentId } = ctx.request.body
  const channel = await Channel.findOne({
    where: {
      uid: parentId,
    },
  })
  const message = await Message.create({
    content,
    owner: userId,
    parentId,
    uid: Number(Date.now().toString().slice(4)),
  })
  await channel.addMessages(message)
  const data = {
    content,
    owner: Number(userId),
    parentId: Number(parentId),
    uid: message.dataValues.uid,
    createdAt: moment(message.dataValues.createdAt).format(
      "YYYY-MM-DD HH:mm:ss"
    ),
  }

  const ret = {
    type: 0,
    code: 200,
    msg: "ok",
    data,
  }
  ctx.io.in(parentId).emit("addNewMessage", JSON.stringify(data))
  ctx.response.body = JSON.stringify(ret)
}

module.exports = {
  "GET /message": get_message,
  "POST /message": create_message,
}
