#!/usr/bin/node

fs = require("fs");
path = require("path");

fsobj=JSON.parse(fs.readFileSync("./fsobj.2"))


function ff (fsobj,parent) {
    fsobj.paths = {};
    fsobj.path = parent;
//Sort the filenames case-insensitively
    if (fsobj.files.length > 0) {
	fsobj.files.sort((a,b) => {
	    const nameA = a.filename.toUpperCase();
	    const nameB = b.filename.toUpperCase();
	    if (nameA < nameB) return -1;
	    if (nameA > nameB)return 1;
	    return 0
	})
    }		
			
    for (let i =0; i < fsobj.directories.length; i++) {
	let x = fsobj.directories[i];
	let parentt = parent + "." + i;
	if(x) {
	    let y = path.basename(x.dirname);
	    fsobj.paths[y] = x ;
	    ff(x,parentt)
	}
    }
}

ff(fsobj,"");

