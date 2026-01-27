fs = require("fs")
path = require("path");

const NodeID3 = require('node-id3');

const genrs = JSON.parse(fs.readFileSync("Genre_s.json"));

function searchFsObj (fsobj, rearray) {
    let score = rearray.length;
    let gobj = fsobj;
    let robj = [];

    ff({lobj: fsobj,fMassage: (lobj,patth,parent)=>{lobj.path = patth;lobj.parent = parent;}})
    ff({
	lobj: fsobj,
	fFile: (lobj) => {
	    let n = 0;
	    for(let i =0; i< score; i++){
		let re = rearray[i];
		let searchstring = lobj.dirname;
		if (re.test(searchstring)) {
		    n++;
		    continue;
		}
		for (let x = 0; x <  lobj.files.length; x++){
		    searchstring=lobj.files[x].filename;
		    if (lobj.files[x].title != undefined)
			searchstring = searchstring + lobj.files[x].title;
		    if (lobj.files[x].artist != undefined)
			searchstring = searchstring + lobj.files[x].artist;
		    if (lobj.files[x].album != undefined)
			searchstring = searchstring + lobj.files[x].album;
		    if (lobj.files[x].albumartist != undefined)
			searchstring = searchstring + lobj.files[x].albumartist;
		    if (lobj.files[x].composer != undefined)
			searchstring = searchstring + lobj.files[x].composer;
		    if (re.test(searchstring)) {
			n++;
			break;
		    }
		}
	    }
	    if (n >= score) {
		/*			    console.log("Here ",
					    rearray,
					    score,
					    lobj.path,
					    lobj.directories.length,
					    lobj.dirname)*/
		if (lobj.directories.length == 0) {
		    robj.push(lobj);
		}else{ //mkDirObj only works on the global fsobj
		    let dirobj = mkDirObj(lobj.path,fsobj);
		    robj.push(dirobj);
		}
	    }
	}
    })

    return robj

}



function countAttr (fsobj) {
    robj = {length: 0, title: 0, artist: 0, album: 0, albumcount: 0};
    ff({
	lobj: fsobj,
	fFile: (lobj) => {
	    if(lobj.files.length > 0 ) robj.albumcount++;
	    robj.length +=  lobj.files.length;
	    for (let x = 0; x <  lobj.files.length; x++){
		if (lobj.files[x].title != undefined) ++robj.title;
		if (lobj.files[x].artist != undefined) ++robj.artist;
		if (lobj.files[x].album != undefined) ++robj.album;
	    }
	    
	}
    });
    return robj
}

function mkDirObj(pathn,obj) {
    let numeric_path = pathn.split('.').filter(x => x);
    while((x = numeric_path.shift()) != undefined) obj=obj.directories[x];
    let directories, aa  = [];
    for (let i = 0; i < obj.directories.length; i++) {
	let f1 = {};
	if (obj.directories[i].files.length > 0) {
	    f1 = obj.directories[i].files[0]
	} else {
	    f1= {"album": undefined};
	}
        aa[i] = {
	    "name":path.basename(obj.directories[i].dirname),
	    "album": f1.album,
	    "path": obj.directories[i].path,
	    "perma": obj.directories[i].perma,
	    "newartist":  obj.directories[i].newartist,
	    "template": obj.directories[i].template,
	    "ndirs": obj.directories[i].directories.length
	};
    }
    if (aa.length > 0) {
	aa.sort((a,b) => {
	    const nameA = a.name.toUpperCase();
	    const nameB = b.name.toUpperCase();
	    if (nameA < nameB) return -1;
	    if (nameA > nameB)return 1;
	    return 0
	})
    }		
    return {
	'dirname': obj.dirname,
	'album': obj.album,
	'files': obj.files,
	'parent': obj.parent,
	'path': obj.path,
	'perma': obj.perma,
	'html': obj.html,
	'directories': aa,
	'params': {"d": obj.parent },
	'serverpath': "/"
    }
}


// ff modifies, massages or gains data from the fsobj

function ff ({
    lobj = {},
    patth = ".",
    parent = "",
    fMassage = ()=>{},
    fFile = ()=>{},
    fDir = ()=>{},
    fRet = ()=>{}
}) 
{
    if (process.env.APPLAIZ_DBG_FF) console.error(
        {"dirname":lobj.dirname,"path":patth}
    );

    fMassage(lobj,patth,parent);

    // fFile could, e. g., sort the filenames case-insensitively
    // or, as in countAttr(), count file attributes

    if (lobj.files.length > 0) {
	fFile(lobj)
    }		

    //fDir could, e. g. add a paths object to the directory object

    for (let i =0; i < lobj.directories.length; i++) {
	if (process.env.APPLAIZ_DBG_FF) console.error({"directory":i});
	let x = lobj.directories[i];
	if(x) {
	    fDir(lobj,x);
	    let z;
	    if (lobj.path=="."){  z = ""} else z = lobj.path;

	    fRet(
		ff({
		lobj: x,
		patth: z + "." + i,
		parent: lobj.path,
		fMassage: fMassage,
		fFile: fFile,
		fDir: fDir,
		fRet: fRet
		}),
		i,
		lobj.directories.length
	   )
	}
    }
    return lobj;
}




function searchDirObjs(searchterms, fsobj,parentpath) {//returns a dirObj
    let aa  = searchterms.split(",");
    let rearray = [];
    for (r of aa) rearray.push(new RegExp(r.trim(),'i'));
    let output = searchFsObj(fsobj,rearray);
    let robj = {};
    robj.dirname = "Search: " + searchterms;
    robj.parent = parentpath;
    robj.path = searchterms;
    robj.files = [];
    robj.directories = [];
    robj.params = {"s": searchterms ,"p": parentpath };
    robj.serverpath = "/search";
    for (let x in output) robj.directories.push({"name": path.basename(output[x].dirname),"path": output[x].path, "perma": output[x].perma});
    return robj;
}

function m4aFile(fn) {
    /*

      m4a tags
      https://atomicparsley.sourceforge.net/mpeg-4files.html

      m4a genre ids: egrep Genre_ MediaInfoLib/Source/Resource/Text/Language/DefaultLanguage.csv
      https://github.com/MediaArea/MediaInfoLib/blob/master/Source/Resource/Text/Language/DefaultLanguage.csv
      
     */

    stats=fs.statSync(fn);
    console.error("file name",fn,"stats ",stats.size);
    b = Buffer.alloc(stats.size);
    b = fs.readFileSync(fn);
    
    let ilistl = b[b.indexOf("ilst")-2]*256 + b[b.indexOf("ilst")-1];
    console.error("ilistl = ",ilistl);
    if (!ilistl) return 0;
    let bilst = Buffer.allocUnsafe(ilistl);
    for(i = 0; i < ilistl; i++)bilst[i]=b[b.indexOf("ilst")+i];
    let pointer = 0;
    let title,album, track, year,genre,albumartist,composer = "";
    let artist = " ";
    let meta = {};
    meta.filename = path.basename(fn);
    while (pointer >= 0) {
	let tag = "";
	pointer = bilst.indexOf('data',pointer+1);
	let tagslice = bilst.slice(pointer-8,pointer-2)
	for (let i = 0; i < tagslice.length; i++) {
	    tag=tag.concat(String.fromCharCode(tagslice[i]))
	}
	tag = tag.replace(/[\x00-\x01]/g,"")
	// console.error("tag = ",tag)
	value = bilst.slice(pointer+4,pointer + bilst[pointer - 1] +bilst[pointer -2]*0x100 -1);
	
	if (tag == 'trkn') {
	    track = value[11] < 10?'0' + value[11]:value[11];
	    if (value[13] > 0) track = track + " of " + value[13];
	    meta.trackNumber=track;
	}
	
	if (tag == 'gnre') {
	    genre = genrs[value[9]];
	    meta.genre = genre;
	}
	
	value = value.toString().replace(/[\x00-\x01]/g,"")
	if (tag == '©nam') {title = value;meta.title=title}
	if (tag == '©ART' || tag == '©art') {artist = artist + value;meta.artist=artist}
	if (tag == 'aART') {albumartist = value;meta.albumartist = albumartist}
	if (tag == '©day') {year = value;meta.year=year}
	if (tag == '©alb') {album = value;meta.album=album}
	if (tag == '©gen') {genre = value;meta.genre=genre}
	if (tag == '©wrt') {composer = value;meta.composer=composer}
    }
    console.error("album:",meta.album,"title:",meta.title,"genre:",meta.genre);
    return meta
}

function mp3File (fn) {
    const re = /(mp3|flac|wav$)/i;
    let re_gnre = /\((\d+)\)/;
    let gnre_result;
    if (re.test(fn)) {
		    try {
			let tags = NodeID3.read(fn);console.error("tags: ",tags)
			const filename = path.basename(fn);
			return {filename, ...(
			    (a) => {
				let obj = {};
				for(x of ["title","artist","album","year","genre","performerInfo","composer","trackNumber"])
				{
				    if(x == "performerInfo"){
					obj["albumartist"] = a[x]
				    } else {
					obj[x]=a[x]
				    }
				};
				gnre_result = re_gnre.exec(obj.genre);
			    if (gnre_result) {obj.genre = genrs[ + gnre_result[1] + 1]};
				return obj}
			)(tags)
			       };
		    } catch (error) {
			console.error(filename + " " + error);
			return 0
		    }
    
    }
}

function newOnly (fsobj, ndays) {

let outobj = {
    "directories": [],
    "files": [],
    "dirname": "./Applaiz",
    "perma": "applaiz"
}

    
    return { "isnewobj":  ff( 
	{
	    lobj:fsobj,
	    
	    // x: a directory object  ;  y: one of the directories in that object
	    
	    fDir:(x,y)=>{  // If a directory exists in the
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
		    
		    if ( ago < ndays ){
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
    ),
	     "outobj": outobj
	   }
}

function newHTML(fsobj , n) {

    
    let html_out = ``;

    ff( //begin L4
	{
	    lobj:ff( //begin L3
		{
		    lobj:ff( //begin L2
			{
			    lobj: newOnly(fsobj, n).isnewobj    // L1
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
		locname = path.basename(y.dirname);
		
		html_out = html_out + `
     <li perma=` + y.perma + ` ><span class="applaiznew applaizli" perma="` +  y.perma  +  `" id="` +  y.perma + `"  >` + locname + `</span>
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
    

    return html_out
}


module.exports = { countAttr, ff, mkDirObj, searchFsObj, searchDirObjs, m4aFile, mp3File, newOnly, newHTML };
