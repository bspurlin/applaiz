import { useEffect, useState, useRef } from "react";
import { flushSync } from "react-dom";

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
    const [myChoiceId, setMyChoiceId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
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
			dirobjcache.current = {...dirobjcache.current,[data.path]: data} ;

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

//    console.log("dirobj", dirobj);

    //Event handler sets dirobj to the parent, triggering render of the parent
    const handleBack = (parent,path) => {
	if (true) {
	    let lobj = dirobjcache.current[parent];
	    console.log("handleback parent: ",  parent, "dirobjcache.current[parent]", lobj)
	    console.log("handleback path: ",  path, "dirobjcache.current[path]", lobj)
	    flushSync(() => {
		setDirobj(lobj);
	    });
	    const el = nodeRefs.current.get(path);
	    if (el) {
		el.classList.add('highlight');
		el.scrollIntoView({ block: "center",behavior: 'smooth' });
		// or el.focus(), measure with getBoundingClientRect(), etc.
	    }
	    
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
									  
    return (
	<div className="w-full max-w-md">

    {status == "ready" && (

	<ul >
	    <li   key={dirobj.perma} className="sticky top-0 z-10 bg-gray-100 p-4 font-bold border-b border-gray-300 h-14 flex items-center rounded-lg"  >
		<button  onClick={() => {handleBack(dirobj.parent,dirobj.path)}} ><span>Back</span></button>
	    </li>
        {dirobj.directories.map((directory, index) => (
            <li class="rounded-box"  id={directory.path} key={directory.perma || index} ref={registerRef(directory.path)} >
              <button onClick={() => {
			  handleDirobjChange(directory.perma,directory.path);
		      }}>
		<span>{directory.name.replace(/\./g," ")}</span>
            </button>
          </li>
        ))
	}
      </ul>
    )}
  </div>
);
}
