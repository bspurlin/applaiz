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


  //Event handler updates options.body
  const handleFilterChange = (newQuery) => {
    setOptions(prev => ({ ...prev, body: '{"d":"' + newQuery + '"}' }));
  };

    return (
	<div className="w-full max-w-md">

    {status == "ready" && (

	<ul>
	    <li class="rounded-box"   key={dirobj.perma}>
		<button  onClick={() => setDirobj(prevdir)} ><span>Back</span></button>
	    </li>
        {dirobj.directories.map((directory, index) => (
          <li class="rounded-box"   key={directory.perma || index}>
            <button onClick={() => handleFilterChange(directory.perma)}>
		<span>{directory.name.replace(/\./g," ")}</span>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
}
