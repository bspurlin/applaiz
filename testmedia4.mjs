#!/usr/bin/node

import mediainfo from "node-mediainfo";
let testname="Applaiz/Music by Label/Sony Vivarte/21 Music From The Court Of Charles V Nicolas Gombert Huelgas-Ensemble Paul Van Nevel/03 - Media vita.mp3"
let fs = await import("node:fs");
let direntries = fs.readdirSync(process.argv[2],{withFileTypes:"true"})



let filepromises = [];

for ( let i = 0; i < direntries.length; i++ ) {
    if(direntries[i].name.match(/(mp3|m4a)$/i)){
	let fname=direntries[i].path + "/" + direntries[i].name;
	if(process.env.APPLAIZ_DBG) console.log(fname)
	filepromises.push( await mediainfo(fname))
    }
}



Promise.all(filepromises).then(i => {

    for (const x of i) {
	
	console.log(
	    {
		trackNumber: x.media.track[0].Track_Position,
		genre: x.media.track[0].Genre,
		title: x.media.track[0].Title,
		artist: x.media.track[0].Performer,
		albumartist: x.media.track[0].Album_Performer,
		year: x.media.track[0].Recorded_Date,
		album: x.media.track[0].Album,
		composer: x.media.track[0].Composer
	    }
	)
    }
})


