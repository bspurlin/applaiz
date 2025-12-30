#!/usr/bin/node

opt = require('node-getopt').create([
    ['n' , '='                    , 'new days','n'],
    ['f', '=', 'json dirobj file']
]).parseSystem()

fs = require("fs");

if (opt.options.n && opt.options.f){
    //OK
   
} else {
    console.error("Usage: tst5.js -n <number of days> -f <json file> "
		 );
    process.exit(1);
}
const { newHTML } = require("./modules.js");


console.log(newHTML(JSON.parse(fs.readFileSync(opt.options.f)),opt.options.n))

