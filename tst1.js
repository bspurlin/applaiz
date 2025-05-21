#!/usr/bin/node

fs = require("fs");

function ff ({
    robj = {}, //robj is local (parameter)
    patth = ".",
    parent = "",
    fMassage = ()=>{},
    fFile = ()=>{},
    fDir = ()=>{}
}) 
{
    fMassage(robj,patth,parent);

    // fFile could, e. g., sort the filenames case-insensitively
    // or, as in countAttr(), count file attributes

    if (robj.files.length > 0) {
	fFile(robj)
    }		

    //fDir could, e. g. add a paths object to the directory object
    
    for (let i =0; i < robj.directories.length; i++) {
	let x = robj.directories[i];
	if(x) {
	    fDir(robj,x);
	    let z;
	    if (robj.path=="."){  z = ""} else z = robj.path;
	    robj = ff({
		robj: x,
		patth: z + "." + i,
		parent: robj.path,
		fMassage: fMassage,
		fFile: fFile,
		fDir: fDir,
		})
	}
    }
    return robj;
}

if(process.argv[2]){
    console.error(process.argv[2]);
    fsobj=JSON.parse(fs.readFileSync(process.argv[2])); // fsobj is global
    console.log(
	ff(
	    {
		robj:fsobj,
		// Test that ff() is working by popping a couple of files and
		// comparing output to input
		fFile:(x)=>{x.files.pop();x.files.pop()}
	    }
	)
    )
}
