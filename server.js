import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import http from 'http'; 
import fs from 'fs';
import bodyParser from 'body-parser';
import express from 'express';
const app = express();
import cors from 'cors';
app.use(cors({
    origin: '*'
}));

let n_new_days = 0;
import Getopt from 'node-getopt';
const opt = Getopt.create([
    ['' , 'n_new_days[=]'                    , 'new days','n'],
]);
opt.parseSystem();
if (opt.options.n_new_days ){
    n_new_days = opt.options.n_new_days;
    console.log({"n_new_days": n_new_days})
}

import {ff, mkDirObj, searchDirObjs, newHTML } from "./modules.js";
let permalinks = {};

// massage the filesystem-object
const fsobj = ff(
    {
	lobj: JSON.parse(fs.readFileSync("./fsobj")),
	fMassage: (obj, patth, parent) => { //give every directory
	    obj.path = patth;     // a dot-numeric path
	    obj.parent = parent;  // and a parent so we can go back
	    permalinks[obj.perma] = obj.path;
	    obj.template = 0
	},
	fFile: (obj) => {             // Sort the list of files case-
	    obj.files.sort((a,b) => { //insensitively		       
		const nameA = a.filename.toUpperCase();
		const nameB = b.filename.toUpperCase();
		if (nameA < nameB) return -1;
		if (nameA > nameB)return 1;
		return 0
	    })
	}
    }
)

if (n_new_days > 0) {
    let newdir = {
	"directories":[],
	"files":[],
	"dirname": "New!",
	"perma": "Newbang",
	"path": "." + fsobj.directories.length,
	"html": newHTML(structuredClone(fsobj), n_new_days),
	"template": 1
    };
    fsobj.directories.push(newdir);
    permalinks[newdir.perma] = newdir.path
}

app.use(express.static('public'))
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

let re = /%23/ig;

app.post('/dirobj/',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    let d = permalinks[req.body.d];
    let retval = mkDirObj(d,fsobj);
    if(req.body.parent) retval.parent = req.body.parent;
    console.log({
	"dirObj":JSON.stringify(req.body),
	"dir":d,
	"dirname":retval.dirname,
	"template":retval.template,
	"dn":req.get("ssl_client_s_dn"),
	"sn": req.get("ssl_client_m_serial"),
	"verified": req.get("ssl_client_verify")});
    res.end(JSON.stringify(retval));
});

app.post('/dirobj_nocache/',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    console.log({
	"dirobj_nocache":JSON.stringify(req.body),
	"dn":req.get("ssl_client_s_dn"),
	"sn": req.get("ssl_client_m_serial"),
	"verified": req.get("ssl_client_verify")});
    res.end(JSON.stringify(mkDirObj(req.body.d,fsobj)));
});



app.post('/search/',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    let found = searchDirObjs(req.body.s,fsobj,req.body.p);
    console.log({"Search: ": JSON.stringify(req.body),"found":found.directories.length});
    res.end(JSON.stringify(found));
});

app.get('/node_modules/ejs/ejs.min.js', (req, res)=>{  
   res.sendFile( __dirname + "/" + "/node_modules/ejs/ejs.min.js" );  
}) 

app.get('/icons/*', (req, res)=>{  
    res.sendFile( __dirname + "/" + req.path)
})

app.get('/css/*', (req, res)=>{  
    res.sendFile( __dirname + "/" + req.path)
})

app.get('/Applaiz/*', (req, res)=>{
    let decoded = decodeURI(req.path);
    decoded = decoded.replace(re,"#");
    console.log("Shared: ",decoded,  req.ip, Date());
    res.sendFile( __dirname + "/" + decoded)
})

app.get('/js/*.js', (req, res)=>{
    console.log({"js route": req.url});
    res.sendFile( __dirname + "/" + req.path,{},(err) => {
	if (err) {
	    res.status(403).send("<b><h3>Not Found</h3></b><p>404 The requested URL was not found on this server.")
	} else {
	    console.log("Sent ", req.url)
	}
    })
})

app.get('/:patth',(req,res)=>{
    console.log(
	{"Get /": 
	 {"URL":req.url,
	  "ip":req.ip,
	  "Date":new Date(),
	  "user-agent":req.get('user-agent'),
	  "X-Forwarded-Host = ": req.get('X-Forwarded-Host'),
	  "X-Forwarded-For = ": req.get('X-Forwarded-For'),
	  "Cf-Access-Authenticated-User-Email = ": req.get('Cf-Access-Authenticated-User-Email'),
	  "patth": req.params.patth}
	}
    );

    res.render("index",{"obj": {"patth":req.params.patth}});
});

app.listen({port: process.env.NODE_PORT, host: process.env.NODE_HOST}, ()=>{
    console.log('App listening on ' + process.env.NODE_HOST + ':' + process.env.NODE_PORT)
})
