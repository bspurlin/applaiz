import { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'react-router-dom';


// Outside App, top-level

const BackButton = ({ dirobj, onBackAction }) => (
    <span key={dirobj.perma} className=" z-10 w-16 bg-yellow-50 text-white font-semibold border
 px-6 py-2 rounded-full">
        <button onClick={() => onBackAction(dirobj.parent, dirobj.path)}><img src="/api/icons/back.gif" /></button>
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
            <div
		style={{
		    position:'fixed', 
                    top: pos.top,
                    left: pos.left,
		    zIndex:'100',
		    borderRadius: '12px',
		    background:'white',
		    border:'6px solid gray',

		    color:'#700070', 
		    font:'larger',
		    right:'0',
		    width:'206px'		}}
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
                     <div key={key} className="border" style={{ color: 'purple', fontFamily: 'serif', fontSize: '0.85em'  }}>
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

    const CALLOUT_WIDTH = 200; // matches maxWidth in NowPlayingCallout
    const MARGIN = 8;

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('d') || undefined;

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

	if (highlightedFileRef.current) {
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
//	console.log('callout lookup', {
//          index: nowPlaying.index,
//        found: !!el,
//            mapKeys: [...nodeRefs.current.keys()],
//	});
	if (el && dirobj.dirname === nowPlaying.dirname) { 
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
            setCalloutPos(null);
	}
    }, [dirobj, nowPlaying?.index]);

    useEffect(() => {
	console.log(dirobj)
    }, [dirobj]);
    


   useEffect(() => {
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

    
    const handlePlayFile = (files, index, dirname) => {
	setNowPlaying({ files, dirname, index });
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
	//console.log({"handledirobchange": dirobj.path,"newPath":newPath ,"current":dirobjcache.current[dirobj.path].dirname},"prevdir",newPath);
	
	if (dirobjcache.current[newPath]) {
	    setDirobj(dirobjcache.current[newPath])
	} else {
	    setOptions(prev => ({ ...prev, body: '{"d":"' + newPerma + '"}' }));
	}
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
                    <div className="sticky top-0 w-full min-h-10 flex items-center  bg-white font-bold">
			<BackButton dirobj={dirobj} onBackAction={handleBack} />
			{nowPlaying && (
			    <>
			   <span  className="px-6 py-2 rounded-full bg-yellow-50 border-[1px]" >
			       {nowPlaying.files[nowPlaying.index].title || nowPlaying.files[nowPlaying.index].filename.replace(/\.(mp3|m4a)/i,"")}
			    </span>
			
			    <span className="font-bold !font-normal">
				{dirobj.name}
			    </span>
			    </>
			)}
		    </div>
		    {templates[dirobj.template]({
			dirobj,
			onDirAction: handleDirobjChange,
			onPlayFile: handlePlayFile,
			registerRef,
		    })}
		</>
            )}
            {nowPlaying && calloutPos && (
		<NowPlayingCallout file={nowPlaying.files[nowPlaying.index]} pos={calloutPos} />
            )}
	    
            {nowPlaying && (

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
