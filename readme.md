# inline-images

by default downloads and replaces remote image links with local paths

change cli.js to use ./index.js to transform html and replace img tags with data URIs, e.g.`<img src="foo.png">` tags with `<img src="data:">`

```
npm install inline-images -g
inline-images index.html > inlined.html
```
