import fs from 'node:fs';
import { ff } from "./modules.js"

// First argument to the script:
// fsobjorig: the fsobj from which permalinks are to be copied
let fsobjorig = JSON.parse(fs.readFileSync(process.argv[2]))

// Second argument to the script:
// fsobjnew: the fsobj in which permas will be replaced by those
// from fsobjorig, for a given dirname
let fsobjnew = JSON.parse(fs.readFileSync(process.argv[3]))

let permasorig = {}
ff({lobj: fsobjorig,fMassage:  (lobj) => {let str=lobj.dirname;str=str.replace(/\/\//,'/');permasorig[str] = lobj.perma}});


// Replace the new perma with the original perma
// if the new dirname exists in the original
let moddedobj = ff({
    lobj: fsobjnew,fMassage:  (lobj) => {
	if  ( permasorig[lobj.dirname] )	lobj.perma = permasorig[lobj.dirname]
    }
});


console.log(JSON.stringify(moddedobj,null,1));
