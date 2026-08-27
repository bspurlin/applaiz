#!/usr/bin/env node


const { default: MediaInfoFactory } = await import("mediainfo.js");


let fs = await import("node:fs");



let { readFile, open, FileHandle } = await import("node:fs/promises");
let direntries = fs.readdirSync(process.argv[2],{withFileTypes:"true"})

let m=await MediaInfoFactory({ format: 'object',full: true })


m.options.Inform= "General;%Album%qqq"

/**
 * Creates a function to read file chunks for MediaInfo analysis.
 * @param {import('fs/promises').FileHandle} fileHandle - The file handle.
 * @returns {import('mediainfo.js').ReadChunkFunc}
 */
function getReadChunkFunction(fileHandle) {
    return async function readChunk(size, offset) {
	const buffer = new Uint8Array(size);
	await fileHandle.read(buffer, 0, size, offset);
	if(size==0) fileHandle.close();
	return buffer;
    };
}

let mpromises = [];


let fhs = []; //filehandles

for ( const f of direntries ) {
    if(f.name.match(/(mp3|m4a)$/i)){
	let fh = await open(f.parentPath + "/" + f.name);
	let stat = await fh.stat();
	let l = stat.size;
	let readChunk = getReadChunkFunction(fh);
	mpromises.push(await m.analyzeData(()=>l, readChunk));
    }
}

   // associate the full file name with each promise




//console.log(mpromises)



Promise.all(mpromises).then( (i) => {
    
    for (const x of i) {
	
	console.log({"x":x.media.track,
	    filename: x.media.track[0].CompleteName,
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
}
			   )





async function findMediaInfo(b,m) {


    let lobj={};

    m.analyzeData(b, m)
    m.analyzeData(b,m)
    
    return lobj
    
}


