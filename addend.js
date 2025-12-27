#!/usr/bin/node

const fs = require('fs');
const {ff, mkDirObj, countAttr,searchFsObj} = require("./modules.js");
opt = require('node-getopt').create([
    ['i', 'input=ARG',  'input fsobj', undefined],
    ['r' , ''                    , 'remove'],
    ['h' , 'help'                , 'display this help']
]).bindHelp().parseSystem();

if(opt.options.i){
    fsobj = JSON.parse(fs.readFileSync(opt.options.i));
}
else return;

// 1st arg: The directory d in which dirobjs will be added, replaced, removed

let d = [];
if (opt.argv[0]) {
    d = opt.argv[0]
}

let addendobj = {};
let addendobj_aa = [];

// 2nd arg: the dirobj file or files created by fsObj.js

if (opt.argv[1]) {
    let fsobj_files = opt.argv[1];
    for (f of fsobj_files.split(",")) {
	addendobj_aa.push(JSON.parse(fs.readFileSync(f)));
    }
}

if (process.env.APPLAIZ_DBG) console.error({argv: opt.argv, replace: opt.options.r,options: opt.options,d: d, addendobj: addendobj});


if(d.length == 0){console.error("input full /-delimited path");process.exit(1)}



let robj = ff(
    {lobj: fsobj,
     fMassage: (obj)=>{
	 let r = -1;	 
	 if (obj.dirname == d){
	     console.error(d, "==", obj.dirname);
	     for ( addendobj of addendobj_aa) {
		 if (opt.options.r){
		     r = obj.directories.findIndex((x)=>x.dirname == addendobj.dirname);
		     if (r >= 0){
			 if (process.env.APPLAIZ_DBG) console.error(
			     {
				 "Replace ":r,
				 "Old dirname": obj.dirname,
				 "New dirname":addendobj.dirname
			     }
			 );
			 if (obj.directories[r].perma) {
			     addendobj.perma = obj.directories[r].perma
			 } else {
			     console.error(
				 {
				     "Replace ":r,
				     "no obj.directories[r].perma":  obj.directories[r].dirname
				 }
			     );
			     process.exit(1)
			 }
			 obj.directories.splice(r,1,addendobj)
		     }
		 }else {
		     if (process.env.APPLAIZ_DBG) console.error(
			 {
			     "Add":  addendobj.dirname,
			     "To":obj.dirname,
			     "length":obj.directories.length,
			     "New dirname":addendobj.dirname
			 }
		     );
		     obj.directories.push(addendobj);
		     if (process.env.APPLAIZ_DBG) console.error(
			 {
			     "Added":addendobj.dirname,
			     "new length":obj.directories.length
			 }
		     )
		 }
	     }
	 }
     }
     
    }
)





console.log(JSON.stringify(fsobj,null,2));

