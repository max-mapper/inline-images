#!/usr/bin/env node

var fs = require('fs')
var inliner = require('./')

var html = fs.readFileSync(process.argv[2])

var inlined = inliner(html)
console.log(inlined.toString())
