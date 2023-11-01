path = require("path");

function countAttr (c, fsobj) {

    if(fsobj.files.length > 0) {
	c.length +=  fsobj.files.length
    }

    for (let x = 0; x <  fsobj.files.length; x++){
	c.title += fsobj.files[x].title != undefined;
	c.artist += fsobj.files[x].artist != undefined;
	c.album += fsobj.files[x].album != undefined;
    }
    
    for(let x =0; x < fsobj.directories.length; x++) {
	c = countAttr(c,fsobj.directories[x]);
    };

    return c;
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


// ff modifes the global fsobj

function ff (fsobj,patth,parent) {
    fsobj.paths = {};
    fsobj.path = patth;
    fsobj.parent = parent;
//Sort the filenames case-insensitively
    if (fsobj.files.length > 0) {
	fsobj.files.sort((a,b) => {
	    const nameA = a.filename.toUpperCase();
	    const nameB = b.filename.toUpperCase();
	    if (nameA < nameB) return -1;
	    if (nameA > nameB)return 1;
	    return 0
	})
    }		

    //Add a paths object to the directory object, and a parent field
    
    for (let i =0; i < fsobj.directories.length; i++) {
	let x = fsobj.directories[i];
	if(x) {
	    let y = path.basename(x.dirname);
	    fsobj.paths[y] = x ;
	    let z;
	    if (fsobj.path=="."){  z = ""} else z = fsobj.path;
	    ff(x,z + "." + i, fsobj.path)
	}
    }
}


module.exports = { countAttr, ff, mkDirObj };
