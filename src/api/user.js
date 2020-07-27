const { User } = require("../models/test")
const jsonwebtoken = require("jsonwebtoken")
const multer = require("@koa/multer")

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

const user_register = async (ctx, next) => {
  const { username, password, nickname } = ctx.request.body
  try {
    await User.create({
      username: username,
      email: "",
      name: nickname,
      password: password,
      uid: Number(Date.now().toString().slice(4)),
    })
  } catch (error) {
    ctx.response.body = JSON.stringify({ type: 1, code: 500, msg: "error" })
  }
  ctx.response.body = JSON.stringify({ type: 0, code: 200, msg: "success" })
}

const user_login = async (ctx, next) => {
  const { username, password } = ctx.request.body
  const user = await User.findOne({
    where: {
      username,
      password,
    },
  })
  let ret
  if (user === null) {
    ret = {
      type: 1,
      code: 404,
      msg: "user not find",
    }
  } else {
    const { name, avatar, uid } = user
    ret = {
      type: 0,
      code: 200,
      msg: "ok",
      data: {
        name,
        avatar,
        uid,
        token: jsonwebtoken.sign({ name, avatar, uid }, "hahaha", {
          expiresIn: 18000,
        }),
      },
    }
  }
  ctx.response.body = JSON.stringify(ret)
}

const user_auth = async (ctx, next) => {
  let ret
  const token = ctx.header.authorization.split(" ")[1]
  try {
    const decode = jsonwebtoken.verify(token, "hahaha")
    const { name, avatar, uid } = decode
    ret = {
      type: 0,
      code: 200,
      data: {
        name,
        avatar,
        uid,
        token: jsonwebtoken.sign({ name, avatar, uid }, "hahaha", {
          expiresIn: 18000,
        }),
      },
    }
  } catch (err) {
    ret = {
      type: 1,
      code: 200,
      msg: "token expired",
    }
  }
  ctx.response.body = JSON.stringify(ret)
}

const user_update = async (ctx, next) => {
  const { name, userId } = ctx.request.body
  let updateData = {
    name,
  }
  if (ctx.request.file) {
    updateData["avatar"] = `/public/uploads/${ctx.request.file.filename}`
    const user = await User.findOne({
      where: {
        uid: userId,
      },
      attributes: ["avatar"],
    })
    const oldAvatarPath = user.dataValues.avatar
    if (!oldAvatarPath.startsWith("https")) {
      const fs = require("fs")
      const path = require("path")
      fs.unlink(path.join(__dirname, `..${oldAvatarPath}`), (err) => {
        if (err) throw err
        console.log("path/file.txt was deleted")
      })
    }
  }

  await User.update(updateData, {
    where: {
      uid: userId,
    },
  })
  const newUser = await User.findOne({
    where: {
      uid: userId,
    },
  })
  const { avatar } = newUser.dataValues
  const ret = {
    type: 0,
    code: 200,
    msg: "ok",
    data: {
      name,
      avatar,
    },
  }
  ctx.response.body = JSON.stringify(ret)
}

module.exports = {
  "POST /register": user_register,
  "POST /login": user_login,
  "GET /auth": user_auth,
  "PATCH /user": {
    middleware: upload,
    callback: user_update,
  },
}
