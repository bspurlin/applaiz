#!/usr/bin/node

fs = require("fs");
path = require("path");
opt = require('node-getopt').create([
    ['f','', "count the filename, album, artist, title in an fsobj"],
    ['s' , '=', 'search string-pattern'],
    ['p','=',"path name in number-dot format"],
    ['g','', "generate a mkdirobj"]
]).parseSystem();

size1of = require('object-sizeof');
const Fuse = require('fuse.js');


fsobj=JSON.parse(fs.readFileSync(opt.argv[0]));

const {countAttr, ff, mkDirObj, searchFsObj } = require("./modules.js");




function searchDirObjs(searchres, fsobj) {
    let aa  = searchres.split(",");
    let rearray = []
    for (r of aa) rearray.push(new RegExp(r,'i'));
    let output = searchFsObj(fsobj,rearray);
    fs.writeFileSync(1,JSON.stringify(output,null,1))
}

if (opt.options.s)  searchDirObjs(opt.options.s,fsobj);

if(opt.options.f) {console.log("count = ",countAttr(fsobj))};

if (opt.options.g && opt.options.p) console.log(mkDirObj(opt.options.p, fsobj));
