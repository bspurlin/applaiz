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
    <button onClick={() => handleFilterChange(dirobj.directories[0].perma)}>Change Options</button>
  );
}

