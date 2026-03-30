#!/usr/bin/node
const { exec } = await import('child_process');

const { readdir, readdirSync, readFileSync } = await  import('fs');

const crypto = await import("node:crypto");

console.error( process.argv[2])

let global="yyyy";
const command = 'mediascript.sh';

const execPromise = (command) => {return new Promise((resolve, reject) => {exec(command, (error, stdout, stderr) => {if(error){reject(error); return};resolve(stdout.trim());});});};

async function fsExec(dirname) {
    let fsr = {};
    fsr.directories = [];
    fsr.files = [];
    fsr.dirname = dirname;
    let applaizfiles = [];
    let result = await execPromise(command  + " \"" + dirname +"\"");
    let x = result.toString();
    //console.log({x: x});
    x=x.replace(/\p{C}/gu,''); //Delete control or invisible characters
    x=x.replace(/qx[A-z]+qx: qxqx,/g,"");  // Delete empties  
    x=x.replace(/,\s+qx[A-z]+qx: qxqx\s+\}/g," }");
    x = x.replace(/qxqx\s+}/,"qxqx}");
    x = x.replace(/\"/g,"");
    x = x.replace(/\\/g,"\\\\");
    x = x.replace(/qx/g,"\"");
    let mobj = JSON.parse(x);
    fsr.files=mobj;
    fsr.perma =   crypto.createHash('shake128').update(fsr.dirname + Date.now().toString()).digest("base64url")
    let direntries = readdirSync(dirname,{withFileTypes:"true"});
    	for (let i =0; i < direntries.length; i++ ) {
	    let entry = direntries[i];
	    if(entry.isDirectory()) {
		fsr.directories.push(await fsExec(entry.parentPath + "/" + entry.name));
		console.error(dirname + "/" + entry.name);
	    } else if ( entry.isFile() && entry.name == "applaiz-files.json") {
		fsr.files = JSON.parse(readFileSync(dirname + "/" + entry.name));
		break
	    }
	}

    return fsr;
}



let out=await fsExec(process.argv[2])

console.log(JSON.stringify(out,null,2));
