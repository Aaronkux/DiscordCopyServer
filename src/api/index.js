const fs = require("fs");
const path = require("path");

function addMapping(mapping, router) {
  for (let url in mapping) {
    if (url.startsWith("GET ")) {
      const reqPath = url.substr(4);
      if (typeof mapping[url] === "object") {
        const { middleware, callback } = mapping[url];
        router.get(reqPath, middleware, callback);
      } else {
        router.get(reqPath, mapping[url]);
      }
      console.log(`register URL mapping: GET /api/v1${reqPath}`);
    } else if (url.startsWith("POST ")) {
      const reqPath = url.substr(5);
      if (typeof mapping[url] === "object") {
        const { middleware, callback } = mapping[url];
        router.post(reqPath, middleware, callback);
      } else {
        router.post(reqPath, mapping[url]);
      }
      console.log(`register URL mapping: POST /api/v1${reqPath}`);
    } else if (url.startsWith("PATCH ")) {
      const reqPath = url.substr(6);
      if (typeof mapping[url] === "object") {
        const { middleware, callback } = mapping[url];
        router.patch(reqPath, middleware, callback);
      } else {
        router.patch(reqPath, mapping[url]);
      }
      console.log(`register URL mapping: PATCH /api/v1${reqPath}`);
    } else {
      console.log(`invalid URL: ${url}`);
    }
  }
}

function addControllers(router) {
  const files = fs.readdirSync(__dirname);
  const js_files = files.filter((f) => f.endsWith(".js"));
  for (let f of js_files) {
    let mapping = require(path.join(__dirname, f));
    addMapping(mapping, router);
  }
}

module.exports = function () {
  const router = require("koa-router")().prefix("/api/v1");
  addControllers(router);
  return router.routes();
};
