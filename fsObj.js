#!/usr/bin/node

const { readdir } = require('fs');
const NodeID3 = require('node-id3');


function fst (arg,space) {
    let re = /(mp3|m4a)/i;
    let fsr = {};
    readdir(arg,{withFileTypes:"true"}, (e,files) => {
	if(e){console.log("error " + e)} else {
	    console.log(space + arg); 
	    for (let i =0; i < files.length; i++ ) {
		let entry = files[i];
		if(entry.isDirectory()) {
		    fst(arg + "/" + entry.name,space + "\t");
		} else {
		    let tags = {title:"",album:"",artist:""};
		    console.log(space + "\t" + entry.name);
		    if (re.test(entry.name)) {
			tags = NodeID3.read(arg + "/" + entry.name);
			console.log(space +"\t\t" + JSON.stringify(tags));
		    }
		   // console.log(space + "\t" +  entry.name + "\n"
		//		+ tags.title + "\n"
		//		+ tags.artist + "\n"
		//		+ tags.album);
		}
	    }
	}
    }
	   )
}

fst(process.argv[2],"");
