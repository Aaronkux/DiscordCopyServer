module.exports = (sequelize, DataTypes) => {
  class Channel extends sequelize.Sequelize.Model {}
  Channel.init(
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
      type: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER(2),
        allowNull: false,
      },
      parentId: {
        type: DataTypes.INTEGER(2),
        allowNull: true,
        defaultValue: null,
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
      modelName: "channel",
    }
  );
  return Channel;
};
