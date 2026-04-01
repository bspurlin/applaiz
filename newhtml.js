#!/usr/bin/env node

import { newHTML } from "./modules.js";

import Getopt from 'node-getopt';

const opt = Getopt.create([
    ['n' , '='                    , 'new days','n'],
    ['i', '=', 'json dirobj file']
])
opt.parseSystem()

import fs from "fs";

if (opt.options.n && opt.options.i){
    //OK
   
} else {
    console.error("Usage: newhtml.js -n <number of days> -i <json file> "
		 );
    process.exit(1);
}

console.log(newHTML(JSON.parse(fs.readFileSync(opt.options.i)),opt.options.n))

