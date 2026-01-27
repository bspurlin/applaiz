let fs = require("node:fs");
(async ()=>{
    let { default: mediaInfoFactory } = await import("mediainfo.js");
    let mediainfo = await mediaInfoFactory({ format: 'json'});
    let buffer1=fs.readFileSync("Applaiz/Classical/Prokofiev/Prokofiev Piano Concerto No. 5/01_Allegro con\ brio.mp3" );
    let buffer=fs.readFileSync("Applaiz/Opera/John.Adams.Nixon.In.China.De.Waart-wav-ape/CD305-Sitting around the radio.m4a")
    let oobj = mediainfo.analyzeData(()=>buffer.length,()=>buffer);
    let oobj2 = mediainfo.analyzeData(()=>buffer1.length,()=>buffer1);
    console.log({"oobj": oobj,"oobj2":oobj2});
})()
