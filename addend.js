#!/usr/bin/env node

import fs from 'fs';
import {ff, mkDirObj, countAttr,searchFsObj} from "./modules.js";
import { dirname } from 'path';



import Getopt from 'node-getopt';

const opt = Getopt.create([
    ['i', 'input=ARG',  'input fsobj', undefined],
    ['r' , ''                    , 'replace'],
    ['' ,'del='                   , 'delete'],  
    ['h' , 'help'                , 'display this help']
])
opt.bindHelp().parseSystem();

if((opt.options.del && opt.options.r) || opt.options.del == "-r") {
    console.error("Cannot delete " + opt.options.del + " and replace at the same time\n")
    process.exit(1)
}

let fsobj =  {};

if(opt.options.i){
    fsobj = JSON.parse(fs.readFileSync(opt.options.i));
}
else {console.error("addend.js -i <fsobj> ..."); process.exit(1)};



let addendobj_aa = [];

// 1st arg: the dirobj file or comma-delimited
// list of files created by fsObj.js

if (opt.argv[0]) {
    let fsobj_files = opt.argv[0];
    for (f of fsobj_files.split(",")) {
	addendobj_aa.push(JSON.parse(fs.readFileSync(f)));
    }
} else if (opt.options.del) {
    const bdel=opt.options.del;
    for (let d of bdel.split(",")) {
	addendobj_aa.push({"dirname": d})
    }
}


if (process.env.APPLAIZ_DBG) console.error({argv: opt.argv, replace: opt.options.r,options: opt.options, addendobj_aa: addendobj_aa});


let robj = ff(
    {lobj: fsobj,
     fMassage: (obj)=>{
	 let r = -1;	 	 
	 for ( let addendobj of addendobj_aa) {
	     if (dirname(addendobj.dirname) == obj.dirname) {
		 if (opt.options.r) {
		     r = obj.directories.findIndex((x)=>x.dirname == addendobj.dirname);
		     if (r >= 0){
			 if (process.env.APPLAIZ_DBG) console.error(
			     {
				 "Replacing ":obj.directories[r].dirname,
				 "Containing dirname": obj.dirname,
				 "With dirname":addendobj.dirname
			     }
			 );
			 if (obj.directories[r].perma) {
			     addendobj.perma = obj.directories[r].perma
			 } else {
			     console.error(
				 {
				     "Replace - no perma ":r,
				     "no obj.directories[r].perma":  obj.directories[r].dirname
				 }
			     );
			     process.exit(1)
			 }
			 obj.directories.splice(r,1,addendobj)
		     }
		 } else if(opt.argv[0]){
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
     },
     fDir: (lobj,x)=>{
	 for ( let addendobj of addendobj_aa) {
	     if (opt.options.del && addendobj.dirname == x.dirname){
		 console.error({"Delete": x.dirname});
		 lobj.directories = lobj.directories.filter(dir => dir.dirname != addendobj.dirname )
	     }
	 }
     }
    }
)
    





console.log(JSON.stringify(fsobj,null,2));

