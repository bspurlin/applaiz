#!/usr/bin/node

const { readdir, readdirSync, readFileSync } = require('fs');
const NodeID3 = require('node-id3');
const re = /(mp3|m4a|flac|wav$)/i;
const regexm4a = new RegExp('\.m4a$','i')
const regextherest = new RegExp('(\.mp3$|\.wav$|\.flac$)','i')


const {m4aFile, mp3File } = require("./modules.js");

// option "-s" to follow symbolic links
opt = require('node-getopt').create([['s' , '', 'short option.']]).parseSystem();

let dirobj = {};
let space = "\t";
let meta;

function fst (dirname,space) {
    let fsr = {};
    fsr.directories = [];
    fsr.files = [];
    fsr.dirname = dirname;
    let applaizfiles = [];
    try {
	let direntries = readdirSync(dirname,{withFileTypes:"true"});
	let ndrs=0;
	for (let i =0; i < direntries.length; i++ ) {
	    let entry = direntries[i];
	    if(entry.isDirectory()) {
		fsr.directories.push(fst(dirname + "/" + entry.name));
		ndrs++
		console.error(dirname + "/" + entry.name);
	    } else if ( entry.isFile() && entry.name == "applaiz-files.json") {
		fsr.files = JSON.parse(readFileSync(dirname + "/" + entry.name));
		break
	    }
	    else if (re.test(entry.name)) {
		const filename = dirname + "/" + entry.name;
		try {
		    if (regexm4a.test(filename)) {
			fsr.files.push(m4aFile(filename));
		    };
		    if (regextherest.test(filename)) {
			fsr.files.push(mp3File(filename));
		    }
		} catch (error) {
		    console.error(entry.name + " " + error)
		}
		
	    } else if (entry.isSymbolicLink() && opt.options.s) {
		    fsr.directories.push(fst(dirname + "/" + entry.name));
		    console.error(dirname + "/" + entry.name);
		
	    }
	}
	fsr.ndirs = ndrs
    } catch (error) {console.error(dirname + " " + error)}
    return fsr
} 

out = fst(opt.argv[0]);

console.log(JSON.stringify(out,null,2));
