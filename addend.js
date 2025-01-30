#!/usr/bin/node

const fs = require('fs');
const {ff, mkDirObj, countAttr,searchFsObj} = require("./modules.js");
opt = require('node-getopt').create([
    ['r' , ''                    , 'remove'],
    ['h' , 'help'                , 'display this help']
]).bindHelp().parseSystem();

let d = [];
if (opt.argv[0]) {
    d = opt.argv[0]
}

let addendobj = false;

if (opt.argv[1]) {
 addendobj = JSON.parse(fs.readFileSync(opt.argv[1]))
}

if (process.env.APPLAIZ_DBG) console.error({argv: opt.argv, replace: opt.options.r,options: opt.options,d: d, addendobj: addendobj});


if(d.length == 0){console.error("input full /-delimited path");process.exit(1)}

fsobj = JSON.parse(fs.readFileSync("fsobj.5"));


let robj = ff(
    {fsobj: fsobj,
     fMassage: (obj)=>{
	 let r = -1;	 
	 if (obj.dirname == d){
	     if (opt.options.r){
		 r = obj.directories.findIndex((x)=>x.dirname == addendobj.dirname);
		 if (r >= 0){
		     if (process.env.APPLAIZ_DBG) console.error("Replace ",r,"\t",obj.dirname,addendobj.dirname,"\n");
		     obj.directories.splice(r,1,addendobj)
		 }
	     }else {
		 if (process.env.APPLAIZ_DBG) console.error(
		     "Add",
		     obj.dirname,
		     obj.dirname,obj.directories.length,
		     addendobj.dirname
		 );
		 obj.directories.push(addendobj);
		 if (process.env.APPLAIZ_DBG) console.error("Added",addendobj.dirname,obj.directories.length);
	     }
	 }
     }
     
    }
)





console.log(JSON.stringify(fsobj,null,2));

