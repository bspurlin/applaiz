const http = require('http'); 
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
    origin: '*'
}));

const {ff, mkDirObj, searchDirObjs } = require("./modules.js");
let permalinks = {};

// massage the filesystem-object
fsobj = ff(
    {
	lobj: JSON.parse(fs.readFileSync("./fsobj")),
	fMassage: (obj, patth, parent) => { //give every directory
	    obj.path = patth;     // a dot-numeric path
	    obj.parent = parent;  // and a parent so we can go back
	    permalinks[obj.perma] = obj.path 
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

app.use(express.static('public'))
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

let re = /%23/ig;

app.post('/dirobj/',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    let d = permalinks[req.body.d];
    let retval = mkDirObj(d,fsobj);
    console.log({
	"dirObj":JSON.stringify(req.body),
	"dir":d,
	"dirname":retval.dirname,
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
	  "patth": req.params.patth}
	}
    );

    res.render("index",{"obj": {"patth":req.params.patth}});
});

app.listen({port: process.env.NODE_PORT, host: process.env.NODE_HOST}, ()=>{
    console.log('App listening on ' + process.env.NODE_HOST + ':' + process.env.NODE_PORT)
})
