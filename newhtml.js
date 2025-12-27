#!/usr/bin/node

opt = require('node-getopt').create([
    ['n' , '='                    , 'new days','n'],
    ['f', '=', 'json dirobj file']
]).parseSystem()

fs = require("fs");

if (opt.options.n && opt.options.f){
    //OK
   
} else {
    console.error("Usage: tst5.js -n <number of days> -f <json file> "
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

var fsobj = JSON.parse(fs.readFileSync(opt.options.f));




var html_out = `<html>
                   <head>
                   </head>
                   <body>

                         `;

ff( //begin L4
    {
	lobj:ff( //begin L3
	    {
		lobj:ff( //begin L2
		    {
			lobj:ff( //begin L1
			    {
				lobj:fsobj,
				
				// x: a directory object  ;  y: one of the directories in that object
				
				fDir:(x,y)=>{  // L1 if a directory exists in the
				    // filesystem, stat it to determine if it is newer
				    // than n days.
				    if(fs.existsSync(y.dirname)){
					let artist = undefined;
					let stat1 = fs.lstatSync(y.dirname);
					let stat_parent = fs.lstatSync(x.dirname);
					if (y.files &&  y?.files[0]?.artist ) {artist = y.files[0].artist} else {artist = x.dirname.replace(/.+\//,"")};
					y.newartist = artist;
					datenow = Date.now();
					
					ago = 	stat1.mtimeMs < stat1.birthtimeMs?
					    (datenow - stat1.mtimeMs)/86400000 : (datenow - stat1.birthtimeMs)/86400000 ;

					if ( ago < opt.options.n ){
					    if(process.env.APPLAIZ_DBG)
						console.error(
						    {"fDir-x":x.dirname,
						     "fDir-y":y.dirname,
						     "ago":ago,
						     "this mtime < this birthtime": stat1.mtimeMs < stat1.birthtimeMs,
						     "parent mtime < parent birthtime": stat_parent.mtimeMs < stat_parent.birthtimeMs,
						     "newartist": y.newartist
						    }
						);
					    x.isnew = 1;
					    y.isnew = 1; // If a directory is new, its parent is also new
					    outobj.directories.push(y)
					} else {
					    y.isnew = 0;
					}
				    }
				}
			    }
			    
			)    // end L1
			,
			
			fDir:(x,y)=>{  // L2 if a directory is new
			               // its parent is also new.
			    
			    if ( y.isnew) x.isnew = 1;
			    
			}
			
		    }
		)  // end L2
		,
		
		fMassage(lobj) { // L3 we want to ignore what is not new
		    
		    lobj.directories = lobj.directories.filter(dir => dir.isnew == 1 );
		    if (lobj.directories.length > 0 && lobj.files.length > 0) {
			lobj.files = []
		    }
		}
	    }
	)  // end L3
	,
	
	fMassage(lobj) { // L4 Create HTML. Start with an unordered list tag
	                 // for each directory that contains directories

	    if (lobj.directories.length > 0 )html_out = html_out + `
   <ul>
`;

	    if(process.env.APPLAIZ_DBG_HTML)
		console.error(
		    {
			"fMassage lobj": lobj.dirname,
			"fMassage lobj dirl": lobj.directories.length,
			"fMassage lobj filesl": lobj.files.length
		    }
		);
	},
	fDir:(x,y)=>{ // L4 for each directory create a list element
	              // including a link to the applaiz dirobj
	    let l = x.directories.length;
	    name = path.basename(y.dirname);

	    html_out = html_out + `
     <li><a href=https://r.mni.science/` + y.perma + `>` + name + `</a>

`;
	    
	    if(process.env.APPLAIZ_DBG_HTML)
		console.error(
		    {"html-x":x.dirname,
		     "x.directories.length": x.directories.length,
		     "html-y":y.dirname,
		     "x.directories[l - 1].perma": x.directories[l - 1].perma,
		     "y.perma": y.perma
		    }
		);
	}, 
	fRet:(lobj,i,l)=>{ // L4  close the list after all elements in it have been
	                   // processed.
	    if (i == l - 1)  html_out = html_out + `</ul></li>`;
	    if(process.env.APPLAIZ_DBG_HTML)
		console.error(
		    {
			"fRet lobjdirl": lobj.directories.length,
			"fRet i": i,
			"fRet l": l
		    }
		);

	}
    }
)  // end L4


html_out = html_out + `
             </body>
</html>`


console.log(html_out)

//console.log(JSON.stringify(fsobj,null,1))
