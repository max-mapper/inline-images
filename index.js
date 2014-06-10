var cheerio = require('cheerio')
var path = require('path')
var fs = require('fs')
var url = require('url')

var contentTypes = {
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".bmp": "image/bmp",
  ".webp": "image/webp"
}

module.exports = function(html, base) {
  base = base || process.cwd()
  
  var dom = cheerio.load(String(html))
  inlineImages(dom)
  
  return new Buffer(dom.html({decodeEntities: false}))
  
  function inlineImages(dom) {
    var styles = [];
    dom('img').each(function(idx, el) {
      el = dom(el)
      var src = el.attr('src')
      if (src && isLocal(src)) {
        var dir = path.dirname(src)
        var file = path.join(base, src)
        var img = fs.readFileSync(file)
        var contentType = contentTypes[path.extname(file)] || 'image/png'
        var dataUri = "data:" + contentType + ";base64," + img.toString("base64")
        el.attr('src', dataUri)
      }
    })
  }
  
  function isLocal(href) {
    return href && !url.parse(href).hostname;
  }
}
