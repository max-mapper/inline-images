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

module.exports = function (html, base) {
  base = base || process.cwd();

  const dom = cheerio.load(String(html));
  inlineImages(dom);

  return new Buffer(dom.html({ decodeEntities: false }));

  function inlineImages(dom) {
    dom('img').each(function (idx, el) {
      el = dom(el);
      const src = el.attr('src');
      if (src && isLocal(src)) {
        const file = path.join(base, src);
        const img = fs.readFileSync(file);
        const contentType = contentTypes[path.extname(file)] || 'image/png';
        const dataUri = "data:" + contentType + ";base64," + img.toString("base64");
        el.attr('src', dataUri)
      }

      const srcset = el.attr('srcset');
      if (srcset && isLocal(srcset)) {
        const file = path.join(base, srcset);
        const img = fs.readFileSync(file);
        const contentType = contentTypes[path.extname(file)] || 'image/png';
        const dataUri = "data:" + contentType + ";base64," + img.toString("base64");
        el.attr('srcset', dataUri + ' x2')
      }
    })
  }

  function isLocal(href) {
    return href && !url.parse(href).hostname;
  }
};
