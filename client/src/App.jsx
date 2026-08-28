import { useEffect, useState } from "react";

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
    const [prevdir, setPrevDir] = useState(null);
    const [stack, setStack] = useState([]);
    const [dirobjcache, setDirobjCache] = useState({
	path: null
    });
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
			setPrevDir(dirobj);
                        setStatus("ready");
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

    console.log("dirobj", dirobj);

    //Event handler sets dirobj to the parent, triggering render of the parent
    const handleBack = (parent) => {parent && setDirobj(dirobjcache[parent])};


    //Event handler updates options.body triggering fetch of a new dirobj, and caches the current dirobj
    const handleDirobjChange = (newPerma,newdir) => {
	//TBD if (dirobjcache[newdir]) {console.log("cache hit ", newdir);setDirobj(dirobjcache[newdir]);return};
	setDirobjCache(prev => ({ ...prev, [dirobj.path]: dirobj }));
	setOptions(prev => ({ ...prev, body: '{"d":"' + newPerma + '"}' }));
  };
									  
    function push(item) {console.log("pushing",item.dirname);
	    setStack((prevStack) => [...prevStack, item]);
    };

    function pop() {	console.log("before popping",stack[stack.length - 1].dirname,"stacklength",stack.length);
	if (stack.length === 0) return;
  
	// Captures the top item before removing it
	const topItem = stack[stack.length - 1]; 
	
	setStack((prevStack) => prevStack.slice(0, -1));
	return topItem;
    };
	


    return (
	<div className="w-full max-w-md">

    {status == "ready" && (

	<ul>
	    <li class="rounded-box"   key={dirobj.perma}>
		<button  onClick={() => {handleBack(dirobj.parent)}} ><span>Back</span></button>
	    </li>
        {dirobj.directories.map((directory, index) => (
          <li class="rounded-box"   key={directory.perma || index}>
              <button onClick={() => {
			  handleDirobjChange(directory.perma,directory.path);
		      }}>
		<span>{directory.name.replace(/\./g," ")}</span>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
}
