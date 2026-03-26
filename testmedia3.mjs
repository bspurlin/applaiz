#!/usr/bin/node


const { default: MediaInfoFactory } = await import("mediainfo.js");


let fs = await import("node:fs");



let { readFile, open, FileHandle } = await import("node:fs/promises");
let direntries = fs.readdirSync(process.argv[2],{withFileTypes:"true"})

let m=await MediaInfoFactory({ format: 'object' })




/**
 * Creates a function to read file chunks for MediaInfo analysis.
 * @param {import('fs/promises').FileHandle} fileHandle - The file handle.
 * @returns {import('mediainfo.js').ReadChunkFunc}
 */
function getReadChunkFunction(fileHandle) {
    return async function readChunk(size, offset) {
    const buffer = new Uint8Array(size);
    await fileHandle.read(buffer, 0, size, offset);
    return buffer;
  };
}

let mpromises = [];


let fhs = [];

for ( const f of direntries ) {
    if(f.name.match(/(mp3|m4a)$/i)){
	let fh = await open(f.path + "/" + f.name);
	let stat = await fh.stat();
	fhs.push({"fh": fh, "length": stat.size,"name": f.name })
    }
}

    
    for(let i=0; i < fhs.length; i++ ) {
	let f = fhs[i].fh;
	let l = fhs[i].length;console.log({name: fhs[i].name,length: l})
	let readChunk = getReadChunkFunction(f);
	mpromises.push(m.analyzeData(()=>l, readChunk))
	m=await MediaInfoFactory({ format: 'object' })
    }


/*

for (let i of [ fh, fh2 ]) {

    let stat = await i.stat();
    console.log(stat.size)
    let readChunk = getReadChunkFunction(i); 
    mpromises.push(m.analyzeData(()=>stat.size,readChunk))
    m=await MediaInfoFactory({ format: 'object' })
}
*/

console.log(mpromises)



Promise.all(mpromises).then( (i) => {
    
    for (const x of i) {
	
	console.log({
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



/*

async function readMetaData(direntries) {

    let fhs = [];

    for ( const f of direntries ) {
	    if(f.name.match(/(mp3|m4a)$/i)){
		let fh = await open(f.path + "/" + f.name);
		let stat = await fh.stat();
		fhs.push({"fh": fh, "length": stat.size,"name": f.name })
	    }
    }
    console.log({"fhs length": fhs.length});


    let mpromises = [];



    
    for(let i=0; i < fhs.length; i++ ) {
	let f = fhs[i].fh;
	let l = fhs[i].length;console.log({name: fhs[i].name,length: l})
	let readChunk = getReadChunkFunction(f);
	mpromises.push(m.analyzeData(()=>l, readChunk))
    }
    
 
    Promise.all(mpromises).then( (i) => {

	for (const x of i) {

	    console.log({
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
}
				
 
readMetaData(direntries)
*/
