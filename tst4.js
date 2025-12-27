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

var outobj = {
    "directories": [],
    "files": [],
    "dirname": "./Applaiz",
    "perma": "applaiz"
}


ff(
    {
	lobj:JSON.parse(fs.readFileSync(opt.options.f)),
	
	// fDir() - get the stats
	fDir:(x,y)=>{
	    if(fs.existsSync(y.dirname)){
		let artist = undefined;
		if (y.files &&  y?.files[0]?.artist ) {artist = y.files[0].artist} else {artist = x.dirname.replace(/.+\//,"")};
		y.newartist = artist;
		ago = 	(Date.now() - fs.lstatSync(y.dirname).birthtimeMs)/86400000
		ago_parent = 	(Date.now() - fs.lstatSync(x.dirname).birthtimeMs)/86400000
		if ( ago < opt.options.n && ago_parent >= ago){
		    if(process.env.APPLAIZ_DBG)
			console.error(
			    {"fDir-x":x.dirname,
			     "fDir-y":y.dirname,
			     "ago":ago,
			     "ago_parent": ago_parent,
			     "newartist": y.newartist
			    }
			);
		    
		    outobj.directories.push(y)
		}
	    }
	}
    }
    
)


console.log(JSON.stringify(outobj,null,1))
