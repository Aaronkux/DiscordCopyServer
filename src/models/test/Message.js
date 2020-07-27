module.exports = (sequelize, DataTypes) => {
  class Message extends sequelize.Sequelize.Model {}
  Message.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // user uid
      owner: {
        type: DataTypes.INTEGER(13),
        allowNull: false,
      },
      // channel uid
      parentId: {
        type: DataTypes.INTEGER(13),
        allowNull: false,
      },
      uid: {
        type: DataTypes.INTEGER(13),
        allowNull: false,
        unique: true,
      },
    },
    {
      underscored: true,
      sequelize,
      modelName: "message",
    }
  )
  return Message
}
