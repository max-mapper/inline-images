#!/usr/bin/env node

var fs = require("fs");
var inliner = require("./");
var remoteInliner = require("./replace");

var html = fs.readFileSync(process.argv[2]).toString();

var run = async function () {
  var inlined = await remoteInliner(html, process.argv[3]);
  console.log(inlined);
};

run();
