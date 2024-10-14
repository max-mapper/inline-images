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

module.exports = function (html, base) {
  base = base || process.cwd();

  var dom = cheerio.load(String(html));
  inlineImages(dom);

  return new Buffer(dom.html({ decodeEntities: false }));

  function inlineImages(dom) {
    var styles = [];
    dom("img").each(async function (idx, el) {
      el = dom(el);
      var src = el.attr("src");
      if (src && !isLocal) {
        let img = await fetch(src);
        let buf = Buffer.from(await img.arrayBuffer());
        var shasum = crypto.createHash("sha1");
        shasum.update(buf);
        var sha = shasum.digest("hex");
        var contentType = contentTypes[path.extname(src)] || "image/png";
        var file = path.join(base, sha + contentType);
        fs.writeFileSync(file, buf);
        el.attr("src", file);
      }
    });
  }

  function isLocal(href) {
    return href && !url.parse(href).hostname;
  }
};
