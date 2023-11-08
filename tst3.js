#!/usr/bin/node

const Fuse = require('fuse.js');
const fs = require('fs');

fsobj = JSON.parse(fs.readFileSync("mkdirobj.NAXOS-25.4"));

const options = {
    includeScore: true,
    ignoreLocation: true,
    keys: ["title","filename","artist","album","dirname"]
}

let aa = fsobj["files"];

aa.push({"dirname":fsobj['dirname']});

const fuse = new Fuse(aa, options);

console.log(fuse.search('=naxos|=deux'));

