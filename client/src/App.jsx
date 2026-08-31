import { useEffect, useState, useRef } from "react";

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

    const dirobjcache = useRef({
    });


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
    
const [nowPlaying, setNowPlaying] = useState(null);
// nowPlaying shape: { files: [...], dirname: string, index: number }

const audioRef = useRef(null);


    useEffect(() => {
	let isMounted = true;
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
    const handleBack = (parent,path) => {
	if (path != ".") {
	    let lobj = dirobjcache.current[parent];
	    
	    //console.log("handleback parent: ",  parent, "dirobjcache.current[parent]", lobj)
	    //console.log("handleback path: ",  path, "dirobjcache.current[path]", lobj)
	    
	    setDirobj(lobj);
	    
	    setPendingTargetId(path);
	}
    };


    //Event handler updates options.body triggering fetch of a new dirobj,
    // unless cached and sets dirobj from cache 
    
    const handleDirobjChange = (newPerma,newPath) => {
	console.log({"handledirobchange": dirobj.path,"newPath":newPath ,"current":dirobjcache.current[dirobj.path].dirname},"prevdir",newPath);
	
	if (dirobjcache.current[newPath]) {
	    setDirobj(dirobjcache.current[newPath])
	} else {
	    setOptions(prev => ({ ...prev, body: '{"d":"' + newPerma + '"}' }));
	}
    };

    const BackButton= ({dirobj,onBackAction}) => {
	return (
	    <div   key={dirobj.perma} className="sticky top-0 z-10 w-16 bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition"  >
		<button  onClick={() => {onBackAction(dirobj.parent,dirobj.path)}} ><span>Back</span></button>
	    </div>
	)
    }

    const DirectoryList = ({directories,onDirAction }) => {
	return (
	    <ul className="w-full max-w-md">
		{directories.map((directory, index) => (
		    <li class="rounded-box"  id={directory.path} key={directory.perma || index} ref={registerRef(directory.path)} >
			<button onClick={() => {
				    onDirAction(directory.perma,directory.path);
				}}>
			    <span>{directory.name.replace(/\./g," ")}</span>
			</button>
		    </li>
		))
		}
	    </ul>
	)
    }

    const FileList = ({ files, onPlayFile }) => {
	return (
            <ul>
		{files.map((file, index) => (
                    <li
			key={file.filename || index}
			id={index}
			style={{ backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff' }}
			className="w-full border-[0.5px] border-gray-300 text-xs"
                    >
			<button onClick={() => onPlayFile(files, index, dirobj.dirname)}>
                            {file.title || file.filename.replace(/(mp3|m4a$)/i, "")}
			</button>
                    </li>
		))}
            </ul>
	);
    };

    return (
	<div >
	    {status == "ready" && (
		<>
		    <BackButton dirobj={dirobj} onBackAction={handleBack} />
		    <DirectoryList directories={dirobj.directories} onDirAction={handleDirobjChange} />
		    <FileList files={dirobj.files}  onPlayFile={handlePlayFile}  />
		</>
	    )}

	    {nowPlaying && (
            <div className="audio-player-bar sticky bottom-0 z-10 bg-white border-t border-gray-300 p-2">
                <span>
                    {nowPlaying.files[nowPlaying.index].title
                        || nowPlaying.files[nowPlaying.index].filename}
                </span>
                <audio
                    ref={audioRef}
                    src={"http://localhost:3001/" + nowPlaying.dirname + "/" + nowPlaying.files[nowPlaying.index].filename}
                    onEnded={handleTrackEnded}
                    controls
                />
            </div>
        )}
	</div>
    );
}
