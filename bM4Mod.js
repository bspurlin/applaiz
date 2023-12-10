#!/usr/bin/node


fs = require("fs");
path = require("path");
opt = require('node-getopt').create([
    ['s' , '=', 'search string-pattern'],
    ['p','=',"path "],
    ['m','=',"process m4a ftyp"]
]).parseSystem();

const { readFile,open } = require('node:fs/promises');

if (opt.options.m)  fs.writeFileSync(1,JSON.stringify(bM4(opt.options.m),null,1));

function bM4(dirname) {console.log("Here: ",dirname)
    let adir = fs.readdirSync(dirname);
    let dirn = dirname;
    let bigobj = [];
    dirlist=adir.filter((x) => x.match(/^[^\.].+m4a/));
    let b,fn,ftypi,newl,stats,bnewl,i;
    for (filename of dirlist) {
	fn = dirn + "/" + filename;
	stats=fs.statSync(fn);bigobj.push({"filename": filename,"size": stats.size});
	b = fs.readFileSync(fn);
	ftypi = b.indexOf('ftyp')-4;
	newl = b.length - ftypi;
	bnewl=Buffer.allocUnsafe(newl);
	for(i = 0; i < newl; i++) bnewl[i] = b[ftypi +i];
	bnewl[0] = 0; bnewl[1] = 0;
	fs.writeFileSync(fn,bnewl)
    }
    return bigobj
}
	    
