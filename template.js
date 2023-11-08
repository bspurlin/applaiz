function mkTempl(i) {
    return templates[i].replace(/(\r\n|\n|\r)/gm, "")
}

let templates = [`<table>
  <tbody>
    <tr class="indexhead"><th class="indexcolicon"><img class="dirselector" path=<%= obj.parent %> id="parent-a"  src="/icons/back.gif"></th><th class="indexcolname" id="dirname"><%let aa=obj.dirname.split("/")%><%= aa[aa.length - 1]%></th><th></th></tr>

    <% for (let i = 0; i < obj.directories.length; i++) {%>
   <tr >
     <td class="indexcolicon"><img src="/icons/folder.gif">
     </td>
     <td id=dirname<%= obj.paths[obj.directories[i]] %> path=<%= obj.path + "." + obj.paths[obj.directories[i]]%> class="dirselector">
       <%= obj.directories[i]%>
     </td>
     <td>
     </td>
   </tr>
   <%}%>

   <% for (let i = 0; i < obj.files.length; i++) {
      let re = /.(m4a|mp3|wav|flac)$/ig;
      let filename, name, artist, album, title;
      filename = obj.files[i].filename;
      name = filename.replace(re,"");
      if(obj.files[i].title) {
		title = obj.files[i].title.replace(re,"");	       
		if (title.length >= name.length ) name = title
	  };
      if(obj.files[i].album) album = obj.files[i].album;
      if(obj.files[i].artist) artist = obj.files[i].artist; %>
      <tr id="<%= i + 1000%>">
	<td class="indexcolicon" ><img class="soundfile" id="<%= i %>" src="/icons/sound2.gif" filename="<%- filename%>" artist="<%- artist%>" selectiontitle="<%- name%>" album="<%- album%>">
	</td>
	<td class="indexcolname"><%- name%>
	</td>
	<td>
	</td>
      </tr>
      <%}%>
  </tbody>
</table>
`
	    ]

if(typeof module === undefined) {} else { module.exports = { mkTempl } }
