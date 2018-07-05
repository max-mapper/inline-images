#!/usr/bin/env node

const fs = require('fs');
const inliner = require('./');
const program = require('commander');

program.usage('[options] <file|dir>')
    .option('-c, --class <str>', 'Only process img tag whit the class')
    .option('-o, --output <file>', 'Specify output file, use STDOUT by default')
    .option('--output-dir <dir>', 'Specify an output directory')
    .option('--root-dir <path>', 'Path used as root directory to resolve absolute includes')
    .option('--remove-class', 'Remove class in --class options');

program.parse(process.argv);

if (program.args.length !== 1){
  throw Error('require one directory or file')
}
const path = program.args[0];
if(fs.statSync(path).isDirectory()){
  inliner.dir(path, program.opts());
} else {
  inliner.file(path, program.opts());
}
