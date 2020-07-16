module.exports = (sequelize, DataTypes) => {
  class Guild extends sequelize.Sequelize.Model {}
  Guild.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      owner: {
        type: DataTypes.INTEGER(13),
        allowNull: false,
      },
      uid: {
        type: DataTypes.INTEGER(13),
        allowNull: false,
        unique: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
          "https://cdn.discordapp.com/icons/442204458961862657/1dcae90ab46927ffaeb6956b897e4efc.png?size=128",
      },
      changeTime: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "1589956194711",
      },
    },
    {
      underscored: true,
      sequelize,
      modelName: "guild",
    }
  );
  return Guild;
};
