#!/usr/bin/node

fs = require("fs");
path = require("path");
opt = require('node-getopt').create([
    ['f','', "count the filename, album, artist, title in an fsobj"],
    ['s' , '=', 'search string-pattern'],
    ['p','=',"path name in number-dot format"],
    ['g','', "generate a mkdirobj"],
    ['m','=',"process m4a ilst data"],
    ['x','=','optional dirname prefix with -m']
]).parseSystem();

size1of = require('object-sizeof');

if(opt.argv[0])fsobj=JSON.parse(fs.readFileSync(opt.argv[0]));

const {countAttr, ff, mkDirObj, searchFsObj, searchDirObjs, m4aFile, mp3File } = require("./modules.js");

if (opt.options.s)  fs.writeFileSync(1,JSON.stringify(searchDirObjs(opt.options.s,fsobj),null,1));

if(opt.options.f) {
    let count = countAttr(fsobj);
    console.log("total tracks = ", count.length,
                "\ntotal albums = ", count.albumcount,
                "\ntitle tags = ", count.title,
                "\nartist tags = ", count.artist,
                "\nalbum tags = ", count.album
               )
};

if (opt.options.g && opt.options.p) console.log(mkDirObj(opt.options.p, fsobj));

if (opt.options.m)  fs.writeFileSync(1,JSON.stringify(audioMetaData(opt.options.m),null,1));

function audioMetaData (dirname) {
    let adir = fs.readdirSync(dirname);
    let dirn = dirname;
    let bigobj = {};
    bigobj.directories = [];
    bigobj.files = [];
    bigobj.dirname = opt.options.x + "/" + path.basename(dirn); 
    dirlist=adir.filter((x) => x.match(/^[^\.].+(m4a|mp3)/));
    let b,fn;
    for (filename of dirlist) {
	fn = dirn + "/" + filename;
	meta = m4aFile(fn);
	if (!meta ) meta = mp3File(fn);
	meta.filename = filename;
	bigobj.files.push(meta);
    }
    return bigobj    
}
