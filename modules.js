path = require("path");

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
		for (let x = 0; x <  fsobj.files.length; x++){
		    let searchstring=fsobj.files[x].filename;
		    if (fsobj.files[x].title != undefined)
			searchstring = searchstring + fsobj.files[x].title;
		    if (fsobj.files[x].artist != undefined)
			searchstring = searchstring + fsobj.files[x].artist;
		    if (fsobj.files[x].album != undefined)
			searchstring = searchstring + fsobj.files[x].album;
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
    for (let i = 0; i < obj.directories.length; i++) {
        aa[i] = {
	    "name":path.basename(obj.directories[i].dirname),
	    "path": obj.directories[i].path
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




function searchDirObjs(searchterms, fsobj,parentpath) {
    let aa  = searchterms.split(",");
    let rearray = [];
    for (r of aa) rearray.push(new RegExp(r,'i'));
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


module.exports = { countAttr, ff, mkDirObj, searchFsObj, searchDirObjs };
