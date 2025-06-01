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



let robj = ff(
    {fsobj: fsobj,
     fMassage: (obj)=>{
	 let r = -1;	 
	 if (obj.dirname == d){
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
		     obj.directories.splice(r,1,addendobj)
		 }
	     }else {
		 if (process.env.APPLAIZ_DBG) console.error(
		     {
			 "Add":  obj.dirname,
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
)





console.log(JSON.stringify(fsobj,null,2));

