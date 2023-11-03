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

fsobj = JSON.parse(fs.readFileSync("./fsobj.4")); //get the filesystem
tp.ff(fsobj,".",0); // massage it

app.use(express.static('public'))
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

app.post('/',function(req,res){
    res.setHeader('Content-Type', 'application/json');
    console.log("Body: ",JSON.stringify(req.body));
    res.end(JSON.stringify(tp.mkDirObj(req.body.d,fsobj)));
});

app.get('/',function(req,res){
    console.log("Get ",req.headers);
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
    res.sendFile( __dirname + "/" + decodeURI(req.path))
})

app.listen(3000, function () {
  console.log('App listening on port 3000!')
})
