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

const {countAttr, ff, mkDirObj } = require("./modules.js");




function searchDirObjs(sstr, pathn, fsobj) {
    const options = {
	includeScore: true,
	ignoreLocation: true,
	useExtendedSearch: true,
	keys: ["title","filename","artist","album","dirname"]
    }
    let obj = mkDirObj(pathn, fsobj);
    
    let aa = obj["files"];

    aa.push({"dirname":obj['dirname']});

    const fuse = new Fuse(aa, options);
    ss = sstr.split(/\s+/);
    ss.forEach((element, i) => {ss[i] = "'" + element});
    sstr = ss.join(" ");
    sstr = "'"+'"' +"trio in d major"+'"' + " "+"beethoven";
    console.log(sstr,fuse.search(sstr));
    }

if (opt.options.s && opt.options.p)  searchDirObjs(opt.options.s, opt.options.p, fsobj)

if(opt.options.f) {console.log("count = ",countAttr(fsobj))};

if (opt.options.g && opt.options.p) console.log(mkDirObj(opt.options.p, fsobj));
