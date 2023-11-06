
ff(
    fsobj,
    ".",
    0,
    (obj, patth, parent) => {
	obj.path = patth;
	obj.parent = parent;
    },
    (obj) => {
	obj.files.sort((a,b) => {		       
	    const nameA = a.filename.toUpperCase();
	    const nameB = b.filename.toUpperCase();
	    if (nameA < nameB) return -1;
	    if (nameA > nameB)return 1;
	    return 0
	})
    },
    (obj, x)=>{
    	let y = path.basename(x.dirname);
	obj.paths[y] = x ;
    },
    {}
)




