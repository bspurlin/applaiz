#!/usr/bin/env node

import fs from "fs";
import path from "path";
import Getopt from 'node-getopt';

const opt = Getopt.create([
    ['f','', "count the filename, album, artist, title in an fsobj"],
    ['s' , '=', 'search string-pattern within an fsobj'],
    ['p','=',"path name in number-dot format"],
    ['g','', "generate a mkdirobj"],
    ['e' , ''                   , 'is empty'],
    ['m','=',"process m4a ilst data"],
    ['x','=','optional dirname prefix with -m']
])
opt.parseSystem();

import size1of  from 'object-sizeof';

let fsobj = {}

if(opt.argv[0])fsobj=JSON.parse(fs.readFileSync(opt.argv[0]));

import {countAttr, ff, mkDirObj, searchFsObj, searchDirObjs, m4aFile, mp3File } from "./modules.js"

if (opt.options.s)  fs.writeFileSync(1,JSON.stringify(searchDirObjs(opt.options.s,fsobj),null,1));

if(opt.options.f) {
    let count = countAttr(fsobj, opt.options.e);
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
    let dirlist=adir.filter((x) => x.match(/^[^\.].+(m4a|mp3)/));
    let b,fn;
    for (let filename of dirlist) {
	fn = dirn + "/" + filename;
	let meta = m4aFile(fn);
	if (!meta ) meta = mp3File(fn);
	meta.filename = filename;
	bigobj.files.push(meta);
    }
    return bigobj    
}
