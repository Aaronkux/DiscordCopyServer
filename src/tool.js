function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

function successReturn(data) {
  return {
    type: 0,
    code: 200,
    msg: "ok",
    data,
  }
}

module.exports = {
  uniqueArr,
  successReturn,
}
