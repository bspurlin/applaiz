#!/usr/bin/node

opt = require('node-getopt').create([
    ['n' , '='                    , 'new days','n'],
    ['f', '=', 'json dirobj file']
]).parseSystem()

fs = require("fs");

if (opt.options.n && opt.options.f){
    //OK
   
} else {
    console.error("Usage: tst4.js -n <number of days> -f <json file> "
		 );
    process.exit(1);
}
const {countAttr, ff, mkDirObj, searchFsObj, searchDirObjs, m4aFile, mp3File } = require("./modules.js");


ff(
    {
	lobj:JSON.parse(fs.readFileSync(opt.options.f)),
	
	// fDir() - get the stats
	fDir:(x,y)=>{
	    if(fs.existsSync(y.dirname)){
		ago = 	(Date.now() - fs.lstatSync(y.dirname).birthtimeMs)/86400000
		if ( ago < opt.options.n){
		    if(process.env.APPLAIZ_DBG)
			console.error(
			    {"fDir-x":x.dirname,
			     "fDir-y":y.dirname,
			     "ago":ago
			    }
			);
		    console.log(JSON.stringify(y))
		}
	    }
	}
    }
    
)
