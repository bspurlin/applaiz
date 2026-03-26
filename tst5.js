#!/usr/bin/node
const { exec } = require('child_process');
console.log( process.argv[2])

exec("bash mediascript.sh " + "\'" + process.argv[2] + "\'",(error, stdout, stderr) => {
    if (error) {
	console.error(`exec error: ${error.message}`);
	return;
    }
    if (stderr) {
	console.error(`stderr: ${stderr}`);
	return;
    }
    let x = stdout.toString();
    x = x.replace(/\"/g,"");
    x = x.replace(/qq/g,"\"");
    let mobj = JSON.parse(x);
    console.log({mobj: mobj});
});
