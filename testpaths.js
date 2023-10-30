#!/usr/bin/node
fs = require("fs");
path = require("path");
opt = require('node-getopt').create([
    ['f','', 'short option.'],
    ['s' , '=', 'short option.'],
    ['g','','generate a stripped down object from a path. requires opt p'],
    ['p','=']    // a numeric path, e. g. .45.5.1
]).parseSystem();

sizeof = require('object-sizeof');

const mods = require("./modules.js")


/*
 Count the number of sound files in an applaiz filesystem object, and count some ID3 attributes 
 {"length":0,"title":0,"artist":0,"album":0} i. e. length of files array == number of files
 Output looks like:
 count =  56742 title =  52828 artist =  52058 album =  51860
*/




if (opt.argv[0])  fsobj = JSON.parse(fs.readFileSync(opt.argv[0]));
mods.ff(fsobj,"");

if(opt.options.p) console.log(mods.mkDirObj(opt.options.p, fsobj));



if(opt.options.f) {
    let obj =fsobj;
    if(opt.options.p){
	let aa = opt.options.p.split('.').filter(x => x);
	obj=fsobj.directories[aa.shift()];
	while((x = aa.shift()) != undefined) obj=obj.directories[x];
    } 
    let count = mods.countAttr({"length":0,"title":0,"artist":0,"album":0},obj);
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

/*

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

*/

