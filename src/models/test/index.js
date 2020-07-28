const Sequelize = require("sequelize")
const config = require("../../config/database.config")

// 实例化，并指定配置
const sequelize = new Sequelize(config);
const User = sequelize.import(__dirname + "/User");
const Guild = sequelize.import(__dirname + "/Guild");
const Channel = sequelize.import(__dirname + "/Channel");
const Message = sequelize.import(__dirname + "/Message");
const InviteLink = sequelize.import(__dirname + "/InviteLink");

User.belongsToMany(Guild, { through: "UserGuild" })
Guild.belongsToMany(User, { through: "UserGuild" })

Guild.hasMany(Channel, { onDelete: "cascade" })
Channel.belongsTo(Guild)

Channel.hasMany(Message, { onDelete: "cascade" })
Message.belongsTo(Channel)

Guild.hasMany(InviteLink, { onDelete: "cascade" });
InviteLink.belongsTo(Guild);

async function initialize(sequelize) {
  try {
    await sequelize.drop()
    await sequelize.sync({ alter: true }) // { alter: true }
    // User
    // const user = await User.create({ username: 'admin', name: 'alex', email: 'sbvjaiwxd@gmail.com', password: '123', uid: Number(Date.now().toString().slice(4))})
    // const user2 = await User.create({ username: 'test', name: 'aaron', email: '353045905@qq.com', password: '123', uid: Number(Date.now().toString().slice(4))})
    // const user_uid = user.dataValues.uid;
    // // guild1
    // const guild1 = await Guild.create({ name: 'scarFace', owner: user_uid,uid: Number(Date.now().toString().slice(4)), avatar: 'https://cdn.discordapp.com/icons/442204458961862657/1dcae90ab46927ffaeb6956b897e4efc.png?size=128' });
    // // guild2
    // const guild2 = await Guild.create({ name: 'RIP', owner: user_uid, uid: Number(Date.now().toString().slice(4)), avatar: 'https://cdn.discordapp.com/icons/442204458961862657/1dcae90ab46927ffaeb6956b897e4efc.png?size=128' });
    // await user.addGuilds(guild1)
    // await user.addGuilds(guild2)
    // await user2.addGuilds(guild1)
    // await guild1.addUsers(user)
    // await guild1.addUsers(user2)
    // await guild2.addUsers(user)
  } catch (err) {
    console.log(err)
  }
}
// initialize(sequelize)

// 测试连接
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err)
//   });
module.exports = {
  sequelize,
  User,
  Guild,
  Channel,
  Message,
}
