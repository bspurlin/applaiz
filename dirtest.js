const {ff, mkDirObj, countAttr,searchFsObj} =  require("./modules.js")
fs = require("fs");
fsobj = JSON.parse(fs.readFileSync("fsobj"))

ff(
    {
	lobj: fsobj,
	fDir: (lobj,x)=>{
	    if(fs.existsSync(x.dirname)){
		console.error(JSON.stringify(x.files,0,1))
	    }else{console.log(x.dirname," does not exist")}
	}
    }
)
