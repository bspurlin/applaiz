// node repl code used with JSON output from
// v. 6bc5e45 of testpaths.js -m <directory full of m4a files>


obj = JSON.parse(fs.readFileSync('/home/bill/applaiz/m4data.2-a'))
for(x of Object.keys(obj)) {
try { if (!fs.existsSync(obj[x].dirname)) {
fs.mkdirSync(obj[x].dirname)
}
} catch (err) {
  console.error(err);
}
for(x of Object.keys(obj)) {
for(f in obj[x].files) {
fs.cpSync("/home/bill/Music/Meng/SANLING" + f.filename,obj[x].dirname)
}
