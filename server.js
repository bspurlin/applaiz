const http = require('http'); 
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
var index = fs.readFileSync("./index.html")
app.use(cors({
    origin: '*'
}));

const {ff, mkDirObj, searchDirObjs } = require("./modules.js");

// massage the filesystem-object
fsobj = ff(
    {
	lobj: JSON.parse(fs.readFileSync("./fsobj")),
	fMassage: (obj, patth, parent) => { //give every directory
	    obj.path = patth;     // a dot-numeric path
	    obj.parent = parent   // and a parent so we can go back
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
app.set('view engine', 'ejs');
const { render } = require("./node_modules/ejs/ejs.min.js");
const { mkTempl } = require("./template.js");
let re = /%23/ig;

app.get('/dirobj/:patth?',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    console.log({
	"dirObj":req.params.patth,
	"dn":req.get("ssl_client_s_dn"),
	"sn": req.get("ssl_client_m_serial"),
	"verified": req.get("ssl_client_verify")});
        res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(render(mkTempl(0),{obj: mkDirObj(req.params.patth?req.params.patth:".",fsobj)}));
    res.end()
});

app.post('/search/',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    console.log("Search: ",JSON.stringify(req.body));
    res.end(JSON.stringify(searchDirObjs(req.body.s,fsobj,req.body.p)));
});

app.get('/:patth?',(req,res)=>{
    console.log(
	"Get ",
	req.url,
	req.ip,
	new Date(),
	req.get('user-agent'),
	"X-Forwarded-Host = ",
	req.get('X-Forwarded-Host'),
	"X-Forwarded-For = ",
	req.get('X-Forwarded-For')
    );

    res.render("index.ejs",{"obj": {"patth":req.params.patth?req.params.patth:"."}});

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

app.get('/Shared/*', (req, res)=>{
    let decoded = decodeURI(req.path);
    decoded = decoded.replace(re,"#");
    console.log("Shared: ",decoded,  req.ip, Date());
    res.sendFile( __dirname + "/" + decoded)
})

app.get('/*.js', (req, res)=>{
    res.sendFile( __dirname + "/" + req.path)
})

app.listen({port: process.env.NODE_PORT, host: process.env.NODE_HOST}, ()=>{
    console.log('App listening on ' + process.env.NODE_HOST + ':' + process.env.NODE_PORT)
})
