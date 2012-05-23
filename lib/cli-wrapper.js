#!/usr/bin/env node
var path = require("path")
  , args = process.argv.slice(1);

var arg, base;
do arg = args.shift();
while ( arg !== __filename
  && (base = path.basename(arg)) !== "statue"
  && base !== "statue.js"
);
require("./statue").run(args);
