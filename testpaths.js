#!/usr/bin/node

fs = require("fs");
path = require("path");
opt = require('node-getopt').create([['s' , '', 'short option.'],['g','=']]).parseSystem();

fsobj=JSON.parse(fs.readFileSync(opt.argv[0]))


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

function mkTable(path,f) {
    let dirobj = f(path);
    
}


ff(fsobj,"");

if (opt.options.g) mkTable(opt.options.g,(path) => {
    let aa = path.split('.');
    let obj=fsobj.directories[aa.shift()];
    while((x = aa.shift()) != undefined) obj=obj.directories[x];
    return obj
})
