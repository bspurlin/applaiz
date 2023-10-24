#!/usr/bin/node

fs = require("fs");
path = require("path");
opt = require('node-getopt').create([['f','', 'short option.'],['s' , '', 'short option.'],['g','=']]).parseSystem();
sizeof = require('object-sizeof');
fsobj=JSON.parse(fs.readFileSync(opt.argv[0]));

exports.countAttr = countAttr;
exports.ff = ff;

function countAttr (c, fsobj) {

    if(fsobj.files.length > 0) {
	c +=  fsobj.files.length
    }

    for(let x =0; x < fsobj.directories.length; x++) {
	c = countAttr(c,fsobj.directories[x]);
    };

    return c;
}


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

function mkTable(pathn,f) {
    let dirobj = f(pathn);
    
}


ff(fsobj,"");

if(opt.options.f) {console.log("count = ",countAttr(0,fsobj))};

if (opt.options.g) mkTable(opt.options.g,(pathn) => {
    let aa = pathn.split('.').filter(x => x);
    let obj=fsobj.directories[aa.shift()];
    function generateDirFields(obj) {
	while((x = aa.shift()) != undefined) obj=obj.directories[x];
	let directories = [];
	for (let i = 0; i < obj.directories.length; i++)
	    aa[i] = path.basename(obj.directories[i].dirname);
	return {'dirname': obj.dirname,'files': obj.files, 'directories': aa}
    };

    return aa.length?generateDirFields(obj):generateDirFields(fsobj);
})
