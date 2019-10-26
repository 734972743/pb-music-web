import OSS from "ali-oss";

const cli = new OSS({
  region: "oss-cn-beijing",
  accessKeyId: "LTAI4FvYEZDSMScaUFbmoo5y",
  accessKeySecret: "8IEjEEe3FboF2q5eEfr8NSkWMbBTZM",
  bucket: "pb-20191014"
});

export function client() {
  return cli;
}

function add0(m) {
  return m < 10 ? "0" + m : m;
}
export function timestamp() {
  var time = new Date();
  var y = time.getFullYear();
  var m = time.getMonth() + 1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();
  console.log(y);
  return "" + y + add0(m) + add0(d) + add0(h) + add0(mm) + add0(s);
}
