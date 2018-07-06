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
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

const escape = {
  '%': '%25',
  '"': '\'',
  '&': '%26',
  '#': '%23',
  '{': '%7b',
  '}': '%7d',
  '<': '%3c',
  '>': '%3e'
};

module.exports.file = function (file, options) {
  const inlined = inlineImages(file, options);
  if (options.output) {
    fs.writeFileSync(options.output, inlined);
  } else if (options.outputDir) {
    fs.writeFileSync(path.join(options.outputDir, path.basename(file)), inlined);
  } else {
    console.log(inlined);
  }
};

module.exports.dir = function (dir, options) {
  if (!options.outputDir) {
    throw Error('require outdir option if args is a directory')
  }
  if (!fs.statSync(options.outputDir).isDirectory()) {
    throw Error('outdir should be a directory')
  }
  const files = fs.readdirSync(dir).filter(file => path.extname(file) === '.html');
  for (const file of files) {
    const fileName = path.basename(file);
    const inlined = inlineImages(path.join(dir, file), options);
    const output = path.join(options.outputDir, fileName);
    fs.writeFileSync(output, inlined);
  }
};

function inlineImages(htmlFile, options) {
  const selector = createSelector(options.class);
  const rootDir = options.rootDir;
  const relativeDir = path.dirname(htmlFile);
  const dom = cheerio.load(fs.readFileSync(htmlFile).toString(), {decodeEntities: false});
  dom(selector).each(function (index, element) {
    element = dom(element);
    const src = element.attr('src');
    if (src && isLocal(src)) {
      let imgPath;
      if (path.isAbsolute(src)) {
        if (rootDir) {
          imgPath = path.join(rootDir, src);
        } else {
          console.error("skip img '%s' because of --root-dir option unset", src);
          return;
        }
      } else {
        imgPath = path.join(relativeDir, src);
      }
      const contentType = contentTypes[path.extname(imgPath)];
      if (contentType == null) {
        console.error("skip img '%s' because of file type unsupported", src);
        return;
      }
      element.attr('src', convertToDataUrl(contentType, imgPath));
      if (options.class && options.removeClass) {
        const classes = element.attr('class').split(/\s+/);
        if (classes.length === 1)
          element.removeAttr('class');
        else
          element.removeClass(options.class);
      }
    }
  });
  return dom.html({decodeEntities: false});
}

function convertToDataUrl(contentType, imgPath) {
  let content = fs.readFileSync(imgPath);
  if (contentType === contentTypes[".svg"]) {
    const reg = new RegExp(Object.keys(escape).join('|'), 'gi');
    content = content.toString()
        .replace(reg, matched => escape[matched])
        .replace(/\s+/g, ' ');
    return "data:image/svg+xml;charset=utf8," + content;
  } else {
    return "data:" + contentType + ";base64," + content.toString("base64");
  }
}

function createSelector(className) {
  return className ? 'img.' + className : 'img';
}

function isLocal(href) {
  return !url.parse(href).hostname;
}
