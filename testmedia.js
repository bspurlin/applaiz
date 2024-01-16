let  mediainfo  = require("mediainfo.js");
let fs = require("node:fs");
let b = fs.readFileSync("../Music/Shared/Music by Label/Delos/Famous.Film.Themes.8102/01 - Mutiny on the Bounty.mp3");
let oobj = {"a":"b"};

async function findMediaInfo(b,m) {
    let str="";

    oobj = await m.analyzeData(()=>b.length,()=>b);
    aa = oobj.split("\n");
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
    oobj=JSON.parse(str)
}


(async function(){
    let m =  await mediainfo.default({ format: 'json' });
    await findMediaInfo(b,m)
    console.log(
    "title\t", oobj["Track name"],"\n",
    "artist\t",oobj["Performer"],"\n",
    "album\t", oobj["Album"],"\n"
    )}
)();




