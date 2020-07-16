const Koa = require("koa");
const cors = require("@koa/cors");
const jwt = require("koa-jwt");
const serve = require("koa-static");
const bodyParser = require("koa-bodyparser");
const controller = require("./api");
const mount = require("koa-mount");
const app = new Koa();
const server = require("http").createServer(app.callback());
const io = require("socket.io")(server);

app.context.io = io;

// run SocketIO
require("./socket")(io);

//静态资源
const staticApp = new Koa();
staticApp.use(serve(__dirname + "/public"));
app.use(mount("/public", staticApp));

// 错误处理
app.use((ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.response.body = JSON.stringify({
        type: 1,
        code: 401,
        msg: "token is wrong, please relogin",
      });
    } else {
      throw err;
    }
  });
});

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get("X-Response-Time");
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
});

// set json type
app.use(async (ctx, next) => {
  ctx.response.type = "json";
  await next();
});

// cors
app.use(cors());

// jwt auth
app.use(
  jwt({ secret: "hahaha" }).unless({
    path: [
      /^\/api\/v1\/login/,
      /^\/api\/v1\/register/,
      /^\/api\/v1\/auth/
    ],
  })
);

// body parse
app.use(bodyParser());

// add routes
app.use(controller());

server.listen(3001);
console.log("listening on http://localhost:3001");
