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

const genrs = JSON.parse(fs.readFileSync("Genre_s.json"));

if(opt.argv[0])fsobj=JSON.parse(fs.readFileSync(opt.argv[0]));

const {countAttr, ff, mkDirObj, searchFsObj, searchDirObjs } = require("./modules.js");

const { readFile,open } = require('node:fs/promises');

if (opt.options.s)  fs.writeFileSync(1,JSON.stringify(searchDirObjs(opt.options.s,fsobj),null,1));

if(opt.options.f) {console.log("count = ",countAttr(fsobj))};

if (opt.options.g && opt.options.p) console.log(mkDirObj(opt.options.p, fsobj));

if (opt.options.m)  fs.writeFileSync(1,JSON.stringify(m4aData(opt.options.m),null,1));

function m4aData (dirname) {
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
	stats=fs.statSync(fn);
	console.error("file name",fn,"stats ",stats.size);
	b = Buffer.alloc(stats.size);
	b = fs.readFileSync(fn);

	let ilistl = b[b.indexOf("ilst")-2]*256 + b[b.indexOf("ilst")-1];
	
	let bilst = Buffer.allocUnsafe(ilistl);
	for(i = 0; i < ilistl; i++)bilst[i]=b[b.indexOf("ilst")+i];
	let pointer = 0;
	let dirname, title,album, track, year,genre = "";
	let artist = " ";
	let meta = {};
	meta.filename = filename;
	while (pointer >= 0) {
	    pointer = bilst.indexOf('data',pointer+1);
	    tag = bilst.slice(pointer-7,pointer-2).toString().replace(/[\x00-\x01]/g,"")
	    value = bilst.slice(pointer+4,pointer + bilst[pointer - 1] +bilst[pointer -2]*0x100 -1);

	    if (tag == 'rkn') {
		track = value[11] < 10?'0' + value[11]:value[11];
		track = track + " of " + value[13];
		meta.track=track;
	    }

	    if (tag == 'nre') {
		genre = genrs[value[9]];
		meta.genre = genre;
	    }
	    
	    value = value.toString().replace(/[\x00-\x01]/g,"")
	    if (tag == 'nam') {title = value;meta.title=title}
	    if (tag == 'ART') {artist = artist + value;meta.artist=artist}
	    if (tag == 'day') {year = value;meta.year=year}
	    if (tag == 'alb') {album = value;meta.album=album}
	    if (tag == 'gen') {genre = value;meta.genre=genre}
	}
	console.error("album:",meta.album,"title:",meta.title,"genre:",meta.genre);

	bigobj.files.push(meta);
    }
/*
    for(x of Object.keys(bigobj)) {
	let i = 0, prevartist="", signal=false, dirname = "";
	for(j of bigobj[x].files){
	    if(i > 0 && prevartist != j.artist){
		signal = true;
	    }else {
		dirname=x+j.artist
	    };
	    prevartist=j.artist;i++
	}
	if(signal) {
	    console.error(x," has multiple artists");
	    bigobj[x].dirname=x+" multiple artists"
	}else {
	    console.error("dirname= ",dirname);
	    bigobj[x].dirname=dirname
	}
    }
*/
    return bigobj
    
}
