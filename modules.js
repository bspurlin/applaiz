path = require("path");

function countAttr (fsobj) {
    return ff({
	fsobj: fsobj,
	fFile: (fsobj,robj) => {
	    robj.length +=  fsobj.files.length;
	    for (let x = 0; x <  fsobj.files.length; x++){
		if (fsobj.files[x].title != undefined) ++robj.title;
		if (fsobj.files[x].artist != undefined) ++robj.artist;
		if (fsobj.files[x].album != undefined) ++robj.album;
	    }
	    return robj
	},
	robj: {length: 0, title: 0, artist: 0, album: 0}
    })
}

function mkDirObj(pathn,obj) {
    let aa = pathn.split('.').filter(x => x);
    while((x = aa.shift()) != undefined) obj=obj.directories[x];
    let directories = [];
    let paths = {};
    for (let i = 0; i < obj.directories.length; i++) {
        aa[i] = path.basename(obj.directories[i].dirname);
	paths[aa[i]] = i;
    }
    if (aa.length > 0) {
	aa.sort((a,b) => {
	    const nameA = a.toUpperCase();
	    const nameB = b.toUpperCase();
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
	'paths': paths}
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


module.exports = { countAttr, ff, mkDirObj };
