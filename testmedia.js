let  mediainfo  = require("mediainfo.js");
let fs = require("node:fs");
let b = fs.readFileSync("/home/bill/Music/m4a/Gramophone 2008/The.Debussy.RecordingsA.2008.100CD/01 - Trois Nocturnes - I. Nuages.mp3");
let size = b.length;

async function findMediaInfo(b,size) {
    let str="";
    let m = await mediainfo.default({ format: 'json',chunkSize: size });
    let output = "";
    await m.analyzeData(()=>size,()=>b).then((data)=>{output = data})
    aa = output.split("\n");
    bb=[];
    for (x of aa) if(x) bb.push(x)
    aa=[];
    for (x of bb) if(x == 'General' || x == 'Audio'){}else{aa.push(x)};
    aa = aa.map(str=>str.replace(/\s+:/,":"))
    aa = aa.map(str=>str.replace(/:\s/,":"))
    aa = aa.map(str=>str.replace(/:/,"\":\""))
    aa = aa.map(str=>str.replace(/^(.+)$/,"\"$1\""))
    str = aa.toString()
    str = '{'+str+'}';
    return str
}

findMediaInfo(b,size).then((str) => {
    let obj=JSON.parse(str);
    console.log(obj,"Name:",obj["Track name"],"Performer:",obj["Performer"],"Album:",obj["Album"])
}
)

