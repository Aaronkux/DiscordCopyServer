module.exports = (sequelize, DataTypes) => {
  class User extends sequelize.Sequelize.Model {}
  User.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
          "https://cdn.discordapp.com/avatars/278036884637351936/8c7ebea3b8d97acbda26f6619f9c365e.png?size=128",
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: "user",
    }
  );
  return User;
};
