const { InviteLink, Guild, User } = require("../models/test")
const { successReturn } = require("../tool")

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
    slots
  }
  ctx.response.body = JSON.stringify(successReturn(data))
}

// const join_guild = async (ctx, next) => {}

module.exports = {
  "POST /invite": create_link,
  // "POST /joinGuild": join_guild,
}
