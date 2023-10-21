#!/usr/bin/node

const { readdir, readdirSync } = require('fs');
const NodeID3 = require('node-id3');
const re = /(mp3|m4a)/i;
opt = require('node-getopt').create([['s' , '', 'short option.']]).parseSystem();

let dirobj = {};
let space = "\t";

function fst (dirname,space) {
    let fsr = {};
    fsr.directories = [];
    fsr.files = [];
    fsr.dirname = dirname;
    try {
	let files = readdirSync(dirname,{withFileTypes:"true"});
	
	for (let i =0; i < files.length; i++ ) {
	    let entry = files[i];
	    if(entry.isDirectory()) {
		fsr.directories.push(fst(dirname + "/" + entry.name));
		console.error(dirname + "/" + entry.name);
	    } else if (re.test(entry.name)) {
		    try {
			let tags = NodeID3.read(dirname + "/" + entry.name);
			fsr.files.push({"filename": entry.name, "artist": tags.artist,"title":tags.title,"album":tags.album})
		    } catch (error) {
			console.error(entry.name + " " + error)
		    }
		
	    } else if (entry.isSymbolicLink() && opt.options.s) {
		    fsr.directories.push(fst(dirname + "/" + entry.name));
		    console.error(dirname + "/" + entry.name);
		
	    }
	}
	
    } catch (error) {console.error(dirname + " " + error)}
    return fsr
} 

out = fst(opt.argv[0]);

console.log(JSON.stringify(out));
