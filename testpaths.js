#!/usr/bin/node

fs = require("fs");
path = require("path");
opt = require('node-getopt').create([
    ['f','', 'short option.'],
    ['s' , '', 'short option.'],
    ['g','','generate a stripped down object from a path. requires opt p'],
    ['p','=']    // a numeric path, e. g. .45.5.1
]).parseSystem();

sizeof = require('object-sizeof');
fsobj=JSON.parse(fs.readFileSync(opt.argv[0]));

exports.countAttr = countAttr;
exports.ff = ff;

/*
 Count the number of sound files in an applaiz filesystem object, and count some ID3 attributes 
 {"length":0,"title":0,"artist":0,"album":0} i. e. length of files array == number of files
 Output looks like:
 count =  56742 title =  52828 artist =  52058 album =  51860
*/

function countAttr (c, fsobj) {

    if(fsobj.files.length > 0) {
	c.length +=  fsobj.files.length
    }

    for (let x = 0; x <  fsobj.files.length; x++){
	c.title += fsobj.files[x].title != undefined;
	c.artist += fsobj.files[x].artist != undefined;
	c.album += fsobj.files[x].album != undefined;
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

    //Add a paths object to the directory object, and a parent field
    
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
    console.log(dirobj)
    //TBD
}


ff(fsobj,"");

if(opt.options.f) {
    let obj =fsobj;
    if(opt.options.p){
	let aa = opt.options.p.split('.').filter(x => x);
	obj=fsobj.directories[aa.shift()];
	while((x = aa.shift()) != undefined) obj=obj.directories[x];
    } 
    let count = countAttr({"length":0,"title":0,"artist":0,"album":0},obj);
    console.log("count = ",
		count.length,
		"title = ",
		count.title,
		"artist = ",
		count.artist,
		"album = ",
		count.album);
}

/*
 A numeric pathname, e. g., .42.5.1 ,
 where /Shared/Music is the 43nd directory under Shared,
 Delos is the 6th directory under Shared/Music and
 Art.Blakey.And.The.Jazz.Messengers-Feeling.Good.4007 is the second
 directory under Shared/Music/Delos.
 Find a directory using the numeric pathn
 and extract a stripped-down, non-recursive descriptive object
 from it to be used in creating a table for display
 in the browser.
*/

if (opt.options.g && opt.options.p) mkTable(opt.options.p,(pathn) => { 
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
