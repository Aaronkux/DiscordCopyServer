module.exports = (sequelize, DataTypes) => {
  class InviteLink extends sequelize.Sequelize.Model {}
  InviteLink.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER(13),
        allowNull: false,
      },
      slots: {
        type: DataTypes.INTEGER(13),
        allowNull: false,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      underscored: true,
      sequelize,
      modelName: "invitelink",
    }
  )
  return InviteLink
}
