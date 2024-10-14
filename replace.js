var cheerio = require("cheerio");
var path = require("path");
var fs = require("fs");
var url = require("url");
var crypto = require("crypto");

const { Readable } = require("stream");
const { finished } = require("stream/promises");

var contentTypes = {
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".bmp": "image/bmp",
  ".webp": "image/webp",
};

module.exports = async function (html, base) {
  base = base || process.cwd();

  var inlineImages = async function (dom) {
    const replacedString = await replaceAsync(
      dom,
      /(https?:\/\/.*\.(?:png|jpg|jpeg))/gi,
      replaceImgs
    );
    return replacedString;
  };

  var replaced = await inlineImages(html);
  return replaced;

  function replaceImgs(src) {
    // match is a file
    return new Promise(async (resolve, reject) => {
      if (src && !isLocal(src)) {
        let img = await fetch(src);
        let buf = Buffer.from(await img.arrayBuffer());
        var shasum = crypto.createHash("sha1");
        shasum.update(buf);
        var sha = shasum.digest("hex");
        var contentType = contentTypes[path.extname(src)] || "image/png";
        var file = path.join(base, sha + path.extname(src));
        fs.writeFileSync(file, buf);
        resolve(file);
      } else {
        resolve(src);
      }
    });
  }
  function isLocal(href) {
    return href && !url.parse(href).hostname;
  }
};

async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (full, ...args) => {
    promises.push(asyncFn(full, ...args));
    return full;
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}
