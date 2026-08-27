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


  // 4. Event handler just updates the state
  const handleFilterChange = (newQuery) => {
    setOptions(prev => ({ ...prev, body: '{"d":"' + newQuery + '"}' }));
  };

  return (

      <div className="w-full max-w-md">
	 
      <div className="bg-paper rounded-2xl shadow-2xl px-6 py-8 sm:px-8 sm:py-10"></div>
	  {status == "ready"   &&
	   <button onClick={() => handleFilterChange(dirobj.directories[1].perma)}>
	       <span>{dirobj.dirname}</span>
	   </button>
	  }
	  
 </div>

);

  

}

