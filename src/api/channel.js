const { Guild, Channel } = require("../models/test");

const add_channel = async (ctx, next) => {
  const { name, parentId, type, guildId } = ctx.request.body;
  const guild = await Guild.findOne({
    where: {
      uid: guildId,
    },
  });
  // get the position
  let position;
  if (parentId) {
    const childChannels = await Channel.findAll({
      where: {
        parentId: parentId,
      },
    });
    const lastPosition = childChannels.length;
    position = lastPosition;
  } else {
    const childChannels = await guild.getChannels();
    const lastPosition = childChannels.length;
    position = lastPosition;
  }
  // create
  const channel = await Channel.create({
    name,
    type,
    position,
    parentId,
    uid: Number(Date.now().toString().slice(4)),
  });
  guild.addChannels(channel);
  console.log(channel.dataValues.parentId);
  const ret = {
    type: 0,
    code: 200,
    data: {
      name: channel.dataValues.name,
      channelType: channel.dataValues.type,
      position: channel.dataValues.position,
      uid: channel.dataValues.uid,
      guildId: guildId,
      parentId: channel.dataValues.parentId,
      messageIds: [],
    },
  };
  ctx.response.body = JSON.stringify(ret);
};

const get_channel = async (ctx, next) => {
  const guild_id = ctx.request.query.id;
  const guild = await Guild.findOne({
    where: {
      uid: guild_id,
    },
  });
  const channels = await guild.getChannels();
  const channelsRes = channels.map((channel) => {
    const { name, type, position, uid, parentId } = channel.dataValues;
    return {
      name,
      channel_type: type,
      position,
      uid,
      parent_id: parentId,
      guild_id,
      messageIds: [],
    };
  });
  const ret = {
    type: 0,
    code: 200,
    data: channelsRes,
  };
  ctx.response.body = JSON.stringify(ret);
};

module.exports = {
  "POST /channel": add_channel,
  "GET /channel": get_channel,
};
