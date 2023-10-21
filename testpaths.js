#!/usr/bin/node

fs = require("fs");
path = require("path");

fsobj=JSON.parse(fs.readFileSync("./fsobj.2"))


function ff (fsobj,parent) {
    fsobj.paths = {};
    for (let i =0; i < fsobj.directories.length; i++) {
	let x = fsobj.directories[i];
	fsobj.parent = parent + "." + i;
	if(x) {
	    let y = path.basename(x.dirname);
	    fsobj.paths[y] = x ;
	    ff(x,fsobj.parent)
	}
    }
}

ff(fsobj,"");

