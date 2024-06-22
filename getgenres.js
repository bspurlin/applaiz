#!/usr/bin/node
fs = require("fs")
path = require('path');
opt = require('node-getopt').create([
    ['f','=', "get the filename containing m4a, mp3 paths"]
]).parseSystem();
const {m4aFile, mp3File } = require("./modules.js");
let bigobj={};
bigobj.files = [];
let fulloffiles = opt.options.f;

let str = fs.readFileSync(fulloffiles).toString()
let straa = str.split(/[\r\n]+/)

let meta;
const regexm4a = new RegExp('\.m4a$','i')
const regextherest = new RegExp('(\.mp3$|\.wav$|\.flac$)','i')
let i = 0;
const qw = '"';

fs.writeSync(1,"[");

function writeit(fn,meta,i,length) {
	fs.writeSync(1,'['+qw+path.dirname(fn)+qw+','+qw+meta.genre+qw+']');
	if (i < length - 2) fs.writeSync(1,",")
}

while ( i < straa.length) {
    fn = straa[i]
    meta = "";
    if (regexm4a.test(fn)) {
	meta = m4aFile(fn);
	writeit(fn,meta,i,straa.length)
    }
    if (regextherest.test(fn)){
	meta = mp3File(fn);
	writeit(fn,meta,i,straa.length)
    }
    console.error(i++,"\n",meta);

}

fs.writeSync(1,"]");

