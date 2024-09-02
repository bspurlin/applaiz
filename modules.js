fs = require("fs")
path = require("path");

const NodeID3 = require('node-id3');

const genrs = JSON.parse(fs.readFileSync("Genre_s.json"));

function searchFsObj (fsobj, rearray) {
    let score = rearray.length;
    let gobj = fsobj;
    ff({fsobj: fsobj,fMassage: (fsobj,patth,parent)=>{fsobj.path = patth;fsobj.parent = parent;}})
    return ff({
	fsobj: fsobj,
	fFile: (fsobj,robj) => {
	    let n = 0;
	    for(let i =0; i< score; i++){
		let re = rearray[i];
		let searchstring = fsobj.dirname;
		if (re.test(searchstring)) {
		    n++;
		    continue;
		}
		for (let x = 0; x <  fsobj.files.length; x++){
		    searchstring=fsobj.files[x].filename;
		    if (fsobj.files[x].title != undefined)
			searchstring = searchstring + fsobj.files[x].title;
		    if (fsobj.files[x].artist != undefined)
			searchstring = searchstring + fsobj.files[x].artist;
		    if (fsobj.files[x].album != undefined)
			searchstring = searchstring + fsobj.files[x].album;
		    if (fsobj.files[x].albumartist != undefined)
			searchstring = searchstring + fsobj.files[x].albumartist;
		    if (fsobj.files[x].composer != undefined)
			searchstring = searchstring + fsobj.files[x].composer;
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
					    fsobj.path,
					    fsobj.directories.length,
					    fsobj.dirname)*/
		if (fsobj.directories.length == 0) {
		    robj.push(fsobj);
		}else{ //mkDirObj only works on the global fsobj
		    let dirobj = mkDirObj(fsobj.path,gobj);
		    robj.push(dirobj);
		}
	    }
	return robj;
	},
	robj: []
    })
}



function countAttr (fsobj) {
    return ff({
	fsobj: fsobj,
	fFile: (fsobj,robj) => {
	    if(fsobj.files.length > 0 ) robj.albumcount++;
	    robj.length +=  fsobj.files.length;
	    for (let x = 0; x <  fsobj.files.length; x++){
		if (fsobj.files[x].title != undefined) ++robj.title;
		if (fsobj.files[x].artist != undefined) ++robj.artist;
		if (fsobj.files[x].album != undefined) ++robj.album;
	    }
	    return robj
	},
	robj: {length: 0, title: 0, artist: 0, album: 0, albumcount: 0}
    })
}

function mkDirObj(pathn,obj) {
    let aa = pathn.split('.').filter(x => x);
    while((x = aa.shift()) != undefined) obj=obj.directories[x];
    let directories = [];
    for (let i = 0; i < obj.directories.length; i++) {
        aa[i] = {
	    "name":path.basename(obj.directories[i].dirname),
	    "path": obj.directories[i].path,
	    "ndirs": obj.directories[i].ndirs
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


// ff modifes, massages or gains data from the global fsobj

function ff ({
    fsobj = {},
    patth = ".",
    parent = "",
    fMassage = ()=>{},
    fFile = ()=>{},
    fDir = ()=>{},
    robj = undefined}) {

    fMassage(fsobj,patth,parent);

    // fFile could, e. g., sort the filenames case-insensitively
    // or, as in countAttr(), count file attributes

    if (fsobj.files.length > 0) {
	robj = fFile(fsobj, robj)
    }		

    //fDir could, e. g. add a paths object to the directory object
    
    for (let i =0; i < fsobj.directories.length; i++) {
	let x = fsobj.directories[i];
	if(x) {
	    fDir(fsobj,x);
	    let z;
	    if (fsobj.path=="."){  z = ""} else z = fsobj.path;
	    robj = ff({
		fsobj: x,
		patth: z + "." + i,
		parent: fsobj.path,
		fMassage: fMassage,
		fFile: fFile,
		fDir: fDir,
		robj: robj})
	}
    }
    return robj;
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
