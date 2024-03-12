function mkTempl(i) {
    return templates[i].replace(/(\r\n|\n|\r)/gm, "")
}

let templates = [`<table>



  <tbody>
    <tr class="indexhead">
       <th class="indexcolicon" id= "header1">
         <img class="backselector" path=<%= obj.parent||"." %> id="parent-a"  src="/icons/back.gif">

       </th>
       <th class="" id="headerdirname"><%let aa=obj.dirname.split("/")%><%= aa[aa.length - 1]%></th>
       <th id="header3">
       </th>
       <th id="header4">
           <img src="/icons/blank.gif">

     <div class="dropdown">
      <img id="searchicon" src="/icons/search.svg">
      <form id="sf" onsubmit="console.log(JSON.stringify(event.target[0]));event.preventDefault()"  accept-charset="utf-8" class="dropdown-content" >
	<input type="text" class="searchTerm" name = "s1" placeholder="First?"/>
	<input type="text" class="searchTerm" name = "s2" placeholder="Second?"/>
	<input type="text" class="searchTerm" name = "s3" placeholder="Third?"/>
	<button id="sb" type="submit"  class="searchButton">
          <img src="/icons/search.svg">
	</button>
        <button id="sr" type="button" >
	Search Results
	</button>
      </form>
    </div>



       </th>
    </tr>

   <% for (let i = 0; i < obj.directories.length; i++) {%>

   <tr >
     <td class="indexcolicon">
        <img  id=dirname<%= i %> path=<%= obj.directories[i].path%> class="dirselector" src="/icons/folder.gif">
     </td>
     <td>
       <%= obj.directories[i].name%>
     </td>
     <td>
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
      if(obj.files[i].album) {
         album = obj.files[i].album; } else {
         album = "";
      }
      if(obj.files[i].artist) artist = obj.files[i].artist; %>
      <tr class=indexrow id="<%= i + 1000%>" bgcolor=<%= i%2?"#F0F0F0":"#FFFFFF"   %>>
	<td class="indexcolicon" ><img class="soundfile" id="<%= i %>" src="/icons/loudspeaker.svg" filename="<%- filename%>" artist="<%- artist%>" selectiontitle="<%- name%>" album="<%- album%>">
	</td>
	<td class="indexcolname"><%- name%>
	</td>
	<td>
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
