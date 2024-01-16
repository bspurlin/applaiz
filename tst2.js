// test code for modules:countAttr

ff(fsobj,
   undefined,
   undefined,
   (fsobj,robj) => {
       robj.length +=  fsobj.files.length;
       for (let x = 0; x <  fsobj.files.length; x++){
	   if (fsobj.files[x].title != undefined) ++robj.title;
	   if (fsobj.files[x].artist != undefined) ++robj.artist;
	   if (fsobj.files[x].album != undefined) ++robj.album;
       }
       return robj
   },
   () => {},
   () => {},
   {length: 0, title: 0, artist: 0, album: 0}
  )
 
   
