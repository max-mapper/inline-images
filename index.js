const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const url = require('url');

const contentTypes = {
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".bmp": "image/bmp",
  ".webp": "image/webp"
};

module.exports = function(file) {
  const base = path.dirname(file);
  const dom = cheerio.load(fs.readFileSync(file).toString(), {decodeEntities: false});
  inlineImages(dom);
  
  return new Buffer(dom.html({decodeEntities: false}));
  
  function inlineImages(dom) {
    dom('img').each(function(idx, el) {
      el = dom(el);
      const src = el.attr('src');
      console.info(src);
      if (src && isLocal(src) && !path.isAbsolute(src)) {
        const file = path.join(base, src);
        const img = fs.readFileSync(file);
        const contentType = contentTypes[path.extname(file)];
        if (contentType == null) return;
        const dataUri = "data:" + contentType + ";base64," + img.toString("base64");
        el.attr('src', dataUri)
      }
    })
  }
  
  function isLocal(href) {
    return !url.parse(href).hostname;
  }
};
