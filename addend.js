#!/usr/bin/node

const fs = require('fs');
const {ff, mkDirObj, countAttr,searchFsObj} = require("./modules.js");
opt = require('node-getopt');
let d = [];
if (process.argv[2]) {
    d = process.argv[2]
}

let addendobj = false;

if (process.argv[3]) {
 addendobj = JSON.parse(fs.readFileSync(process.argv[3]))
}
    
if(d.length == 0){console.error("input full /-delimited path");process.exit(1)}

fsobj = JSON.parse(fs.readFileSync("fsobj.5"));

let robj = ff({fsobj: fsobj,
    fMassage: (obj)=>{
	if (obj.dirname == d){
	    //console.log("Bingo",obj.dirname,obj.directories.length);
	    obj.directories.push(addendobj);
	    //console.log("Added",addendobj.dirname,obj.directories.length);
	}
    }
   })





console.log(JSON.stringify(fsobj,null,2));

