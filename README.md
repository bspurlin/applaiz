
Applaiz:  A single-page app that plays audio files from a server.  The design goals are:

1. Serve tens of thousands, hundreds of thousands or millions of tracks in
   such a way that the total number of tracks on the server
   has no impact on performance.
2. Have a smooth interface with car Bluetooth players, including
   all available track metadata, previous track and next track.
3. Search on track title, artist (performer), album name, file name,
   or on combinations of the above.
4. Keep playing audio while changing directories.
5. Play tracks circularly from a directory until a new track is played.
6. Organize the tracks based on the filesystem on the server, but using
   an intermediate (JSON) representation known as an fsObj
   that can be manipulated  separately fron the filesystem if necessary,
   and which contains all data necessary to be sent to the browser
   in objects extracted from the fsObj known as dirObj.
7. When changing directories, do not send any explicit
   directory paths from browser to server. Rather, send
   JSON derived from the position of files in the dirObj,
   or from the search panel.
8. Reuse code with a recursive base similar to a filesystem
   that can be extended for various purposes on the
   server side (search, test, indexing, creation of the dirObj)
   by passing functions corresponding to the objects
   in a directory:  files, directories and metadata.
9. 99.9% of network traffic audio file transfer from server to browser.
   No state on the server.

Licensed under the terms of the Gnu Public License v. 2.0.

Copyright © 2023-2024 William J. Spurlin.  All rights reserved.


function DirectoryView({ dirobj, onNavigate, onFileAction }) {
  return (
    <div>
      <DirectoryList directories={dirobj.directories} onNavigate={onNavigate} />
      <FileList files={dirobj.files} onFileAction={onFileAction} />
    </div>
  );
}

Since dirobj.directories and dirobj.files are just two arrays on the same object, there's no conflict — DirectoryView renders both children unconditionally (React just renders an empty <ul> if one array is empty, which is harmless). No branching needed based on "does this dirobj have files vs. directories" — it always renders both lists, and empty ones simply produce no <li> items.

If you want to visually distinguish them (e.g., directories always listed above files, like most file browsers) that's just a matter of ordering/styling in the JSX — the two components don't need to know anything about each other.

One thing worth deciding: does click behavior on a directory vs. a file need to be visually distinguishable before the click (different icon, indentation, etc.)? If so, that's a styling concern within each component, not a structural one — doesn't change the split.

ok I get it.  The app is a music player which I am translating from an earlier generation of technology into React.  when I have implemented the DirectoryView/DirectoryList/FileList structure, can you help me add some additional features?  A nav bar with back button, notification areas, and a hamburger menu.  Menu choices including an interface to my existing search api, bookmarking utility, random play function, etc.  Audio play widget that can be invoked from a file in a directory and will continue to play files circularly from that same directory even when the DirectoryView is changed.  Another view that uses existing api to present lists of performers, composers.

Absolutely, happy to help with all of that when you're ready. Those are a good set of features to plan for — a few will interact with each other in interesting ways worth thinking through together, especially:

The audio widget continuing playback across DirectoryView navigation — this means playback state needs to live above DirectoryView (probably near App or in a dedicated context/provider), not inside it, since DirectoryView will unmount/remount as you navigate.
Circular play from "that same directory" — you'll want to snapshot the file list at the moment playback starts, independent of whatever the user navigates to afterward.
The hamburger menu tying into search, bookmarking, and random play — these are mostly independent features but will likely all want access to that same shared playback state.
Aug 29, 2026

From Claude
