const http = require('http'); 
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
    origin: '*'
}));
tp = require("./modules.js");

fsobj = JSON.parse(fs.readFileSync("./fsobj.5")); //get the filesystem

// massage the filesystem-object
tp.ff({
    fsobj: fsobj,
    fMassage: (obj, patth, parent) => { //give every directory
	obj.path = patth;     // a dot-numeric path
	obj.parent = parent;  // and a parent so we can go back
    },
    fFile: (obj) => {                    // Sort the list of files case-
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

app.post('/',function(req,res){
    res.setHeader('Content-Type', 'application/json');
    console.log("Body: ",JSON.stringify(req.body));
    res.end(JSON.stringify(tp.mkDirObj(req.body.d,fsobj)));
});

app.post('/search/',function(req,res){
    res.setHeader('Content-Type', 'application/json');
    console.log("Search: ",JSON.stringify(req.body));
    res.end(JSON.stringify(tp.searchDirObjs(req.body.s,fsobj,req.body.p)));
});

app.get('/',function(req,res){
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
    const options = {
        root: path.join(__dirname)
    };
    const filename = "index.html"; 
    res.sendFile(filename,options);
});

app.get('/node_modules/ejs/ejs.min.js', function (req, res) {  
   res.sendFile( __dirname + "/" + "/node_modules/ejs/ejs.min.js" );  
}) 

app.get('/icons/*', function (req, res) {  
    res.sendFile( __dirname + "/" + req.path)
})

app.get('/css/*', function (req, res) {  
    res.sendFile( __dirname + "/" + req.path)
})

app.get('/Shared/*', function (req, res) {
    let decoded = decodeURI(req.path);
    decoded = decoded.replace(re,"#");
    console.log("Shared: ",decoded,  req.ip, Date());
    res.sendFile( __dirname + "/" + decoded)
})

app.get('/*.js', function (req, res) {
    res.sendFile( __dirname + "/" + req.path)
})

app.listen({port: process.env.NODE_PORT, host: process.env.NODE_HOST}, function () {
    console.log('App listening on ' + process.env.NODE_HOST + ':' + process.env.NODE_PORT)
})
