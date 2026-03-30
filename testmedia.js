let  mediainfo  = require("mediainfo.js");

let fs = require("node:fs");

async function findMediaInfo(f,m) {

    let b = fs.readFileSync(f);

    let lobj={};

    await m.analyzeData(()=>b.length,()=>b).then((x)=>{lobj=x; console.log(lobj.media)}) ;
    
    lobj
    
}


(async function(){
let m =  await mediainfo.default({ format: 'object' });    
    console.log(    await findMediaInfo(process.argv[2],m) 
    )}
)();
