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
        aa[i] = {
	    "name":path.basename(obj.directories[i].dirname),
	    "path": obj.directories[i].path,
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
	'files': obj.files,
	'parent': obj.parent,
	'path': obj.path,
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
    fDir = ()=>{}
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

	    ff({
		lobj: x,
		patth: z + "." + i,
		parent: lobj.path,
		fMassage: fMassage,
		fFile: fFile,
		fDir: fDir
	    })

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
    for (let x in output) robj.directories.push({"name": path.basename(output[x].dirname),"path": output[x].path});
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

module.exports = { countAttr, ff, mkDirObj, searchFsObj, searchDirObjs, m4aFile, mp3File };
