import { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'react-router-dom';


// Outside App, top-level

const BackButton = ({ dirobj, onBackAction }) => (
    <span key={dirobj.perma} className=" z-10 w-16 bg-yellow-50 text-white font-semibold border
 px-6 py-2 rounded-full" onClick={() => onBackAction(dirobj.parent, dirobj.path)}  > 
<svg xmlns="http://w3.org" viewBox="0 0 24 24" width="32" height="32" fill="black">
  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
     </svg>
</span>
	
);

    const classNames = [
	"rounded-box",
	"applaiznew"
    ];
    


const DirectoryList = ({ directories, onDirAction, registerRef}) => (
    <ul className="w-full max-w-md">
        {directories.map((directory, index) => (
            <li id={directory.path} key={directory.perma || index} ref={registerRef(directory.path)} className={classNames[directory.template]} >
                <button onClick={() => onDirAction(directory.perma, directory.path)}>
                    <span>{directory.name.replace(/\./g, " ")}</span>
                </button>
            </li>
        ))}
    </ul>
);

const FileList = ({ files, onPlayFile, dirname, registerRef }) => (
    <ul className="pb-16">
        {files.map((file, index) => (
            <li key={index} id={index} ref={registerRef(index)} style={{ backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff' }} className="w-full border-[2px] border-gray-300 text-lg rounded-full">
                <button className="text-left ml-3" onClick={() => onPlayFile(files, index, dirname)}>
                    {file.title || file.filename.replace(/(mp3|m4a$)/i, "")}
                </button>
            </li>
        ))}
    </ul>
);

const NowPlayingCallout = ({ file, pos }) => {
	const fields = [
            ['artist', 'Artist'],
            ['album', 'Album'],
            ['albumartist', 'Album Artist'],
            ['composer', 'Composer'],
            ['genre', 'Genre'],
            ['year', 'Year'],
//            ['trackNumber', 'Track'],
	];
    // 1. Create a Set to track values we've already rendered
    const seenValues = new Set();

    
	return (
            <div className=" rounded overflow-hidden "
		style={{
		    position:'fixed', 
                    top: pos.top,
                    left: pos.left,
		    zIndex:'100',
		    borderRadius: '12px',
		    background:'white',
		    border:'7px solid gray',
		    fontFamily: 'sans-serif',
		    color:'#700070', 
		    right:'0',
		    width:'256px'		}}
            >

		{fields
                 .filter(([key]) => {
                     const value = file[key];
                     // 2. Only keep fields that exist and haven't been seen yet
                     if (!value || seenValues.has(value)) {
			 return false;
                     }
                     seenValues.add(value);
                     return true;
		 })
                 .map(([key, label]) => (
                     <div key={key} className="border" style={{ color: 'purple', fontFamily: 'sans-serif', fontSize: '1.0em'  }}>
                         {file[key]}
                     </div>
                 ))}
            </div>
	);
};


const NewDirobjHtml = ({ html, onDirAction }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleClick = (event) => {
            const li = event.target.closest('.applaizli');
            if (!li || !container.contains(li)) return;

            const perma = li.getAttribute('perma');
	    const path = li.getAttribute('path'); 
            onDirAction(perma, path);
        };

        container.addEventListener('click', handleClick);
        return () => container.removeEventListener('click', handleClick);
    }, [html,  onDirAction]);

    return (
        <div
            ref={containerRef}
	    className="new-tree"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

// Search panel — up to three terms, submit, previous-searches list.
const SearchPanel = ({ terms, onTermChange, onSubmit, onClose, error, history, onSelectHistory }) => (
    <div
        style={{
            position: 'fixed',
            top: 56,
            right: 8,
            width: 260,
            background: 'white',
            border: '7px solid gray',
            borderRadius: 12,
            padding: 12,
            zIndex: 120,
        }}
    >
        {[0, 1, 2].map((i) => (
            <input
                key={i}
                value={terms[i]}
                onChange={(e) => onTermChange(i, e.target.value)}
                placeholder={`Term ${i + 1}`}
                className="border w-full mb-1 px-1"
            />
        ))}
        <div className="flex gap-2 mt-1">
            <button onClick={onSubmit} className="px-3 py-1 rounded-full bg-yellow-50 border-[1px]">
                Search
            </button>
            <button onClick={onClose} className="px-3 py-1 rounded-full bg-yellow-50 border-[1px]">
                Close
            </button>
        </div>

        {error && <div style={{ color: 'red' }} className="mt-2 text-sm">{error}</div>}

        {history.length > 0 && (
            <div className="mt-2">
                <div className="font-bold text-sm">Previous searches</div>
                <ul className="list-none p-0 m-0">
                    {history.map((h, i) => (
                        <li key={i}>
                            <button onClick={() => onSelectHistory(h)} className="text-sm underline">
                                {h.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);


export default function App() {
    const [options, setOptions] = useState({
        mode: 'cors',
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: '{"d":"applaiz"}'
    });
    const [dirobj, setDirobj] = useState(null);
    const [status, setStatus] = useState("loading"); // loading 
    const [errorMsg, setErrorMsg] = useState("");
    const [pendingTargetId, setPendingTargetId] = useState(null);
    const [calloutPos, setCalloutPos] = useState(null);
    const [nowPlaying, setNowPlaying] = useState(null);
    // nowPlaying shape: { files: [...], dirname: string, index: number }
    const [stopplaying, setStopPlaying] = useState(false)
    const dirobjcache = useRef({});
    const audioRef = useRef(null);
    const highlightedFileRef = useRef(null);

    // Map persists across renders, doesn't trigger re-renders itself
    const nodeRefs = useRef(new Map());
    
    // Callback ref factory — registers/unregisters DOM nodes by id
    const registerRef = (id) => (el) => {
	if (el) {
	    nodeRefs.current.set(id, el);
	} else {
	    nodeRefs.current.delete(id); // cleanup on unmount
	}
    };

    const CALLOUT_WIDTH = 250; // matches maxWidth in NowPlayingCallout
    const MARGIN = 8;

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('d') || undefined;

    // --- Search state ---
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerms, setSearchTerms] = useState(['', '', '']);
    const [searchError, setSearchError] = useState(null);
    const [searchHistory, setSearchHistory] = useState([]); // [{ label, path }]

    useEffect(() => {
	let isMounted = true;
	if (query) {
	    console.log("query = ", query);
	    setOptions(prev => ({ ...prev, body: '{"d":"' + query + '"}' }));
	}
	async function fetchData() {
            fetch("/api/dirobj", options)
		.then((res) => {
                    if (!res.ok) throw new Error("Failed to load the dirobj.");
                    return res.json();
		})
		.then((data) => {
                    if (isMounted) {
			setDirobj(data);
			setStatus("ready");
			dirobjcache.current = {...dirobjcache.current,[data.path]: data} ;  // Cache every dirobj that comes off the net	 
                    }
		})
		.catch((err) => {
                    setErrorMsg(err.message);
                    setStatus("error");
		});
	}
	fetchData();
	return () => { isMounted = false; };
    }, [options.body]);

    useEffect(() => {
	if (pendingTargetId) {
	    const el = nodeRefs.current.get(pendingTargetId);
	    if (el) {
		el.classList.add('highlight');
		el.scrollIntoView({ block: "center",behavior: 'smooth' });
		// or el.focus(), measure with getBoundingClientRect(), etc.      
	    } else {
		// targetId might not exist in the cached list — worth guarding
		console.warn(`Element ${pendingTargetId} not found in cached list`);
	    }
	    setPendingTargetId(null); // reset so it doesn't refire
	}
    }, [dirobj, pendingTargetId]);

    useEffect(() => {
	if (nowPlaying && audioRef.current) {
            audioRef.current.load();  // force the element to pick up the new src
            audioRef.current.play().catch((err) => {
		console.warn("Playback failed:", err);
            });
	}
    }, [nowPlaying?.dirname, nowPlaying?.index]);

    useEffect(() => {

	if (highlightedFileRef.current && nowPlaying) {
        if (nowPlaying.index % 2 == 0) {
                highlightedFileRef.current.style.backgroundColor = 'white';
             } else {
                highlightedFileRef.current.style.backgroundColor = '#f0f0f0';
             }
        highlightedFileRef.current.style.fontWeight = '';
        highlightedFileRef.current = null;
	}
	
	if (!nowPlaying) {
            setCalloutPos(null);
            return;
	}

	const el = nodeRefs.current.get(nowPlaying.index);
	const top_el = nodeRefs.current.get("nowplaying_top");
//	console.log('callout lookup', {
//            index: nowPlaying.index,
//            top_el: top_el
//	});
	if (el && dirobj.dirname === nowPlaying.dirname) {
	    top_el.style.color = 'black';
            el.style.backgroundColor = '#fff9c4';
            el.style.fontWeight = 'bold';
            el.scrollIntoView({ block: 'center', behavior: 'auto' });
            const rect = el.getBoundingClientRect();
            highlightedFileRef.current = el;
            setCalloutPos({
		top: rect.top,
		left: window.innerWidth - CALLOUT_WIDTH - MARGIN,
	    });
	 
	} else {
	    top_el.style.color = 'red';
            setCalloutPos(null);
	}
    }, [dirobj, nowPlaying?.index]);

    useEffect(() => {
	if(dirobj) {
	    console.log(dirobj)
	    document.title = dirobj.title
	}
    }, [dirobj]);
    


   useEffect(() => {
    // Deliberately runs on every render (no dependency array) — this is an
    // attempt to trap the browser's native Back button, since this app's
    // own navigation history lives in dirobjcache/handleBack, not in the
    // browser's history stack. See conversation notes: this is a known
    // fragile pattern (Safari in particular may resist it), kept
    // intentionally per current design.
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (event) => {
      window.history.pushState(null, '', window.location.href);
      console.log("Back button navigation was intercepted.");
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
   });

    useEffect(() => {
	if ( stopplaying &&  highlightedFileRef.current){
            console.log({"stopplaying changed to": stopplaying,
			 "highlightedFileRef": highlightedFileRef.current,
			 "color": highlightedFileRef.current.style.backgroundColor,
			 "id": highlightedFileRef.current.id
			});
            if ( highlightedFileRef.current.id % 2 == 0) {
		highlightedFileRef.current.style.backgroundColor = '#f0f0f0';
            } else {
		highlightedFileRef.current.style.backgroundColor = 'white';
            }
	    
	}
    },[stopplaying]);

    const stopAudio = () => {
	if(audioRef.current){
	    audioRef.current.pause();
	    audioRef.current.currentTime = 0; // Reset time to the beginning
	}
	setNowPlaying(false);
	setStopPlaying(true);
    };
    
    const handlePlayFile = (files, index, dirname) => {
	setNowPlaying({ files, dirname, index });
	setStopPlaying(false)
    };

    const handleTrackEnded = () => {
        setNowPlaying((prev) => {
            if (!prev) return prev;
            const nextIndex = (prev.index + 1) % prev.files.length;
            return { ...prev, index: nextIndex };
        });
    };
    
    //Event handler sets dirobj to the parent, triggering render of the parent
    //Use this version if the parent of all New! dirobjs is the New! dirobj itself
//    const handleBack = (parent,path) => {
//	if (path != ".") {
//	    let lobj = dirobjcache.current[parent];
//	    
//	    console.log("handleback: ",  { parent, path, found: !!lobj, cacheKeys: Object.keys(dirobjcache.current) })
//
//	    
//	    setDirobj(lobj);
//	    
//	    setPendingTargetId(path);
//	}
//    };


    const handleBack = async (parent, path) => {

	// If we got here from a bookmark, reset the URL in the location bar
	setSearchParams({});

	if (path == ".") return;
	
	const cached = dirobjcache.current[parent];
	if (cached) {
            setDirobj(cached);
            setPendingTargetId(path);
        
    } else {

    // Not in cache — parent was never fetched directly (e.g. arrived via New!).
    // Fall back to path-based lookup.
    try {
        const res = await fetch("/api/dirobj_nocache", {
            mode: 'cors',
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ d: parent }),
        });
        if (!res.ok) throw new Error("Failed to load parent by path.");
        const data = await res.json();

        dirobjcache.current = { ...dirobjcache.current, [data.path]: data };
        setDirobj(data);
        setPendingTargetId(path);
    } catch (err) {
        console.error("handleBack: path-based fetch failed", err);
        setErrorMsg(err.message);
        setStatus("error");
    }
    }
};
    
    //Event handler updates options.body triggering fetch of a new dirobj,
    // unless cached and sets dirobj from cache 
    
    const handleDirobjChange = (newPerma,newPath) => {
	setSearchParams({});

	//console.log({"handledirobchange": dirobj.path,"newPath":newPath ,"current":dirobjcache.current[dirobj.path].dirname},"prevdir",newPath);
	
	if (dirobjcache.current[newPath]) {
	    setDirobj(dirobjcache.current[newPath])
	} else {
	    setOptions(prev => ({ ...prev, body: '{"d":"' + newPerma + '"}' }));
	}
    };

    // --- Search ---
    // p is the CURRENT dirobj's own path (where the user was standing when
    // they searched) — matches the server's expectation, per the logged
    // example: { s: "liszt,polonaise", p: ".3.10" }.
    const handleSearch = async () => {
	const s = searchTerms.map((t) => t.trim()).filter(Boolean).join(',');
	if (!s) return;

	try {
	    const res = await fetch("/api/search", {
		mode: 'cors',
		method: 'POST',
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ s, p: dirobj.path }),
	    });
	    if (!res.ok) throw new Error("Search request failed.");
	    const data = await res.json();

	    if (!data.directories || data.directories.length === 0) {
		setSearchError(`No results for "${s}"`);
		return;
	    }
	    data.template = 0;
	    for (let i of data.directories) i.template = 0;
	    data.title = "Search: " + data.path;
	    dirobjcache.current = { ...dirobjcache.current, [data.path]: data };
	    setSearchError(null);
	    setDirobj(data);
	    setSearchHistory((prev) => [...prev, { label: s, path: data.path }]);
	    setSearchOpen(false);
	} catch (err) {
	    setSearchError(err.message);
	}
    };

    const handleSelectSearchHistory = (entry) => {
	const cached = dirobjcache.current[entry.path];
	if (cached) {
	    setDirobj(cached);
	    setSearchOpen(false);
	}
    };

    // --- Bookmark ---
    // No JS API exists in any current browser to open the native
    // "add bookmark" dialog or add a bookmark programmatically — that was
    // removed everywhere years ago for abuse-prevention reasons. The
    // fallback: put a stable, perma-based URL in the location bar via
    // useSearchParams (keeps react-router's state in sync) and prompt the
    // user to bookmark it manually (Ctrl/Cmd+D).
    //
    // Virtual dirobjs (search results, and future playlists per the
    // "virtual dirobj" model) have no `perma` — only a session-relative
    // `path` — so they're correctly refused here rather than producing a
    // bookmark link that breaks on the next server restart.
    const handleBookmark = () => {
	if (!dirobj?.perma) {
	    alert("This view doesn't have a permanent link and can't be bookmarked.");
	    return;
	}
	setSearchParams({ d: dirobj.perma });
	alert('Press Ctrl+D (Cmd+D on Mac) to bookmark this page.');
    };

    const templates = [
	({ dirobj, onDirAction, onPlayFile, registerRef }) => (
            <>
		<DirectoryList directories={dirobj.directories} onDirAction={onDirAction} registerRef={registerRef} />
		<FileList files={dirobj.files} onPlayFile={onPlayFile} dirname={dirobj.dirname} registerRef={registerRef} />
            </>
	),
	({ dirobj, onDirAction }) => (
            <NewDirobjHtml html={dirobj.html} onDirAction={onDirAction} />
	),
    ];

    return (
	<div>
            {status == "ready" && (
		<>
                    <div className="sticky top-0 w-full min-h-10 flex items-center gap-2 bg-white font-bold">
<>
			<BackButton dirobj={dirobj} onBackAction={handleBack} />
			
			<span className="px-6 py-2 rounded-full bg-yellow-50 border-[1px]">
				{dirobj.title}
			</span>
</>
			{nowPlaying && !stopplaying && (

			   <span id="nowplaying_top" ref={registerRef("nowplaying_top")}  className="px-6 py-2 rounded-full bg-yellow-50 border-[1px] inline-flex items-center gap-1  " >

<svg viewBox="0 0 24 24" width="24" height="24" fill="black" onClick={stopAudio} xmlns="http://w3.org" >
  <rect x="6" y="6" width="24" height="24" rx="1.5" />
</svg>
			       {nowPlaying.files[nowPlaying.index].title || nowPlaying.files[nowPlaying.index].filename.replace(/\.(mp3|m4a)/i,"")}
			    </span>
			)}

			<span className="ml-auto flex items-center gap-2">
			    <span onClick={() => setSearchOpen((prev) => !prev)} className="px-3 py-2 rounded-full bg-yellow-50 border-[1px]">
				<svg xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="black">
				    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"/>
				</svg>
			    </span>
			    <span onClick={handleBookmark} className="px-3 py-2 rounded-full bg-yellow-50 border-[1px]">
				<svg xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="black">
				    <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z"/>
				</svg>
			    </span>
			</span>
		    </div>
		    {templates[dirobj.template]({
			dirobj,
			onDirAction: handleDirobjChange,
			onPlayFile: handlePlayFile,
			registerRef,
		    })}
		</>
            )}

	    {searchOpen && (
		<SearchPanel
		    terms={searchTerms}
		    onTermChange={(i, val) => setSearchTerms((prev) => prev.map((t, idx) => (idx === i ? val : t)))}
		    onSubmit={handleSearch}
		    onClose={() => setSearchOpen(false)}
		    error={searchError}
		    history={searchHistory}
		    onSelectHistory={handleSelectSearchHistory}
		/>
	    )}

            {nowPlaying && calloutPos && (
		<NowPlayingCallout file={nowPlaying.files[nowPlaying.index]} pos={calloutPos} />
            )}
	    
            {nowPlaying && !stopplaying && (

                    <audio className="fixed inset-x-0 bottom-0 w-3/4 mx-auto  z-10"
			ref={audioRef}
			src={"/api/" + nowPlaying.dirname + "/" + nowPlaying.files[nowPlaying.index].filename.replace(/#/g,'%23')}
			onEnded={handleTrackEnded}
			controls
                    />

            )}
	</div>
    );  
}
