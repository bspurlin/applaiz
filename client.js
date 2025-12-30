
  // The search results button will cycle
  // through the searches stored in the session
  
  function sr_cyclic (aa) {
      let i = 0;
      let f = () =>  {return (i++ % aa.length)}
      return f
  }
  
  


function setMediaMeta (e) {
      if ("mediaSession" in navigator) {console.log("mediaSession: ",playlist[e.audioid].title);
	  navigator.mediaSession.metadata = new MediaMetadata({
	      title: playlist[e.audioid].title ,
	      artist: playlist[e.audioid].artist ,
	      album: playlist[e.audioid].album,
	      artwork: [{ src: "/icons/sound2.gif" }]
	  });e.play();
	  navigator.mediaSession.setActionHandler("nexttrack", () => {
	      let el = document.getElementById(e.nextid + 1000);
	      playAndReset(playlists[globj.dirname][e.nextid]);
	      Highlight(el);
	  });
	  navigator.mediaSession.setActionHandler("previoustrack", () => {
	      let el = document.getElementById(e.previd + 1000)
	      playAndReset(playlists[globj.dirname][e.previd]);
	      Highlight(el);
          });
	  navigator.mediaSession.setActionHandler("pause", () => {
              audioElement.pause()
          });
	  navigator.mediaSession.setActionHandler("play", () => {
              audioElement.play()
          });
      }
      
  }
  
  function playAndReset (e, dirname = globj.dirname) {
      let headerrow = document.querySelector("tr.indexhead");
      let playid = e.id;
      let re = /#/ig;
      let tmpsrc = "";
      audioElement.audioid =  playid;
      audioElement.nextid = e.nextid;
      audioElement.previd = e.previd;
      tmpsrc = encodeURI(e.src);
      tmpsrc = tmpsrc.replace(re,'%23');
      console.log("tmpsrc :",tmpsrc);      
      audioElement.src = tmpsrc;
      audioElement.title = e.title;
      audioElement.dirname = dirname;
      document.getElementById("header3").innerHTML = e.title;
      if (e.album.length > document.getElementById("headerdirname").innerHTML.length) {
	  document.getElementById("headerdirname").innerHTML = e.album;
      } else {
	  let aa=globj.dirname.split("/");
	  document.getElementById("headerdirname").innerHTML = aa[aa.length - 1]
      }
      audioElement.play();
      let audio_element_attributes = [
	  "audioTracks",
	  "autoplay",
	  "buffered",
	  "controller",
	  "controls",
	  "controlsList",
	  "crossOrigin",
	  "currentSrc",
	  "currentTime",
	  "defaultMuted",
	  "defaultPlaybackRate",
	  "disableRemotePlayback",
	  "duration",
	  "ended",
	  "error",
	  "loop",
	  "mediaGroup",
	  "mediaKeys",
	  "muted",
	  "networkState",
	  "paused",
	  "playbackRate",
	  "preservesPitch",
	  "readyState",
	  "remote",
	  "seekable",
	  "sinkId",
	  "src",
	  "srcObject",
	  "textTracks",
	  "videoTracks",
	  "volume"
      ];
//      for (x of audio_element_attributes) 
//	  console.log(x,"\t",audioElement[x])
      audioElement.display = "block";
      
  }

  async  function fetchObj(params,url = document.URL) {
      let anobj = {};
	const options = {
	    mode: 'cors',
	    method: 'POST',
	    headers: {
		"Content-Type": "application/json",
		//'Content-Type':'application/x-www-form-urlencoded'
	    },
	    //body: params
	     body: JSON.stringify(params)
	};
	
    let response = await  fetch( url, options );
      anobj = JSON.parse(await response.text());
      globj = anobj;
    return anobj;
	
  }
  
function renderTable(lobj, templt = 1){
    let html = ejs.render(mkTempl(0) + mkTempl(templt), {obj: lobj});
    document.querySelector("#root").innerHTML = html;
    document.querySelector("body").insertBefore(audioElement,document.querySelector("#ae"));
    document.title = lobj.dirname.replace(/.+\//,"")
    let direlements = document.getElementsByClassName("dirselector");
    for (e of direlements){
	e.addEventListener("click",(event) => {
	      let perma = event.target.getAttribute("perma")
	    let path = event.target.getAttribute("path")
	    let template = event.target.getAttribute("template")
	      let params = {d: perma};
	      if (!dirobj_cache[lobj.path])  dirobj_cache[lobj.path] = lobj;
	      dirobj_cache[lobj.path].scrollpos =  event.target.id;
	      if(dirobj_cache[path]) {
		  lobj = dirobj_cache[path];
		  renderTable(lobj);
	      } else {
		  fetchObj(params,"/dirobj").then(anobj => {
		      renderTable(anobj,template);
		  })
	      }
	  })
      }

    let lielements =  document.getElementsByClassName("applaizli");
    for (e of lielements){
	e.addEventListener("click",(event) => {
	    let perma = event.target.getAttribute("perma");
	    let params = {d: perma};
	    fetchObj(params,"/dirobj").then(anobj => {
		renderTable(anobj,1);
	    })
	}
			  )
    }
    
      let backelem = document.getElementById("parent-a");
      backelem.addEventListener("click",(event) => {
	  let path = event.target.getAttribute("path")
	  let perma = event.target.getAttribute("perma")
	  if(dirobj_cache[path]) {
	      lobj = dirobj_cache[path];
	      renderTable(lobj);
	  } else {
	      let params = {d: path};
	      fetchObj(params,"/dirobj_nocache").then(anobj => {
		  renderTable(anobj);
	      })
	  }
      })
			       	  
	  
      let tform = document.getElementById("sf");
      tform.addEventListener("submit", (e) => {
	  let inputAll = document.querySelectorAll('.searchTerm');
	  let aa = [];
          inputAll.forEach((x) => { if (x.value) aa.push(x.value) })
	  let params = {s: aa.join(","),p: lobj.path};
	  console.log(params);
	  if (params.s.length > 0) {
	      fetchObj(params,"/search").then(anobj => {
		  if(anobj.files.length == 0 && anobj.directories.length ==0) {
		      alert(params.s + " No Results")
		  } else {
		      searchresults.push(anobj);
		      renderTable(anobj);
		  }
	      }
					     )
	      
	  }
      })

      let soundfileelements =  document.getElementsByClassName("soundfile");
      let dirplaylist = [];
      for (let i = 0; i < soundfileelements.length; i++) {
	  let e = soundfileelements[i];
	  let serverpath = lobj.dirname + "/" + e.getAttribute("filename");
	  let playlistEntry = {};
	  playlistEntry.src = serverpath;
	  e.setAttribute("play",e.getAttribute("id"));
	  playlistEntry.title = e.getAttribute("selectiontitle");
	  playlistEntry.artist = e.getAttribute("artist");
	  playlistEntry.album = e.getAttribute("album");
	  playlistEntry.id = i;
	  playlistEntry.nextid = i + 1;
	  if (i == soundfileelements.length -1)  playlistEntry.nextid = 0
	  playlistEntry.previd = i - 1 ; 
          if (i == 0) playlistEntry.previd = soundfileelements.length -1;
	  dirplaylist[i] = playlistEntry;
	  e.addEventListener("click",(event) => {
              let playid = event.target.getAttribute('play');
	      playlist = playlists[lobj.dirname];
              playAndReset(playlist[playid],lobj.dirname);
	      let el = document.getElementById(audioElement.audioid + 1000);
	      Highlight(el, lobj.dirname);
	  });
      }
      playlists[lobj.dirname] = dirplaylist;
      if(searchresults.length > 0) {
	  let el = document.getElementById("sr");
	  el.setAttribute("style", "display: inline;" );
	  el.addEventListener("click",(event) => {
	      renderTable(searchresults[sr_cyc()]);
	  })			     
      }
      if(lobj.scrollpos){
	  let e = document.getElementById(lobj.scrollpos);
	  if(lobj.directories && lobj.directories.length > 10){
	      e.scrollIntoView({block: "center", inline: "nearest"});
	  }else {window.scrollTo(0,0)}
      } else {window.scrollTo(0,0)}

  }

  function Highlight (el, dirname = globj.dirname) {
      if (dirname == globj.dirname) {
	  let rows =  document.getElementsByClassName("indexcolname");
	  for (let i = 0; i < rows.length; i++)
	      rows[i].setAttribute("bgcolor", i % 2 ?"#F0F0F0":"#FFFFFF");
	  el.childNodes[3].setAttribute("bgcolor", "#FFFFC0");
	  el.childNodes[3].focus();
	  el.scrollIntoView({block: "center"});
      }	  

  }
