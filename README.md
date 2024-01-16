
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
