function mkTempl(i) {
    return templates[i].replace(/(\r\n|\n|\r)/gm, "")
}

let templates = [`
<table>

  <tbody>
    <tr class="indexhead">
       <th class="indexcolicon" id= "header1">
         <img class="backselector" path=<%= obj.parent||"." %> id="parent-a"  src="/icons/back.gif">

       </th>
       <th class="" id="headerdirname"><%let aa=obj.dirname.split("/")%><%= aa[aa.length - 1]%></th>
       <th id="header3">
       </th>
       <th id="header4">
           <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="24px" height="24px" onclick="document.location.assign(location.protocol + '//' + location.host + '/' +  globj.perma)"><path d="M 7 5 L 7 28 L 8.59375 26.8125 L 16 21.25 L 23.40625 26.8125 L 25 28 L 25 5 Z M 9 7 L 23 7 L 23 24 L 16.59375 19.1875 L 16 18.75 L 15.40625 19.1875 L 9 24 Z"/></svg>
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

   <% for (let i = 0; i < obj.directories.length; i++) {

let newartist =  "";
if (obj.directories[i].newartist) newartist = obj.directories[i].newartist + " ";

%>


<%    if(obj.directories[i].ndirs > 18) { %>
         <tr class="bigrow"> <% } else  {   %> <tr> <% } %>

     <td class="indexcolicon">
        <img  id=dirname<%= i %> path=<%= obj.directories[i].path %> perma=<%= obj.directories[i].perma %> class="dirselector" src="/icons/folder.gif">
     </td>
     <td>
       <%= newartist + obj.directories[i].name %>
     </td>
     <td>
     </td>
     <td>
     </td>
   </tr>

   <%}%>
</table>
<%# Separate tables for dirs and files; Dir table has 4 columns, files 2 %>
<table id="filetable" dirname="<%= obj.dirname %>">

  <%
  let re = /.(m4a|mp3|wav|flac)$/ig;
  const sepexp = "<hr class='popupsep' />";
  const resep = new RegExp(sepexp + "$");

  for (let i = 0; i < obj.files.length; i++) {
      let metastr = "";
      let filename, name, artist, album, title,composer,year,genre,trackNumber, albumartist;
      filename = obj.files[i].filename;
      name = filename.replace(re,"");
      if(obj.files[i].title) {
		title = obj.files[i].title.replace(re,"");	       
		name = title
	  };
      if(obj.files[i].album) {
         album = obj.files[i].album; } else {
         album = "";
      }
      artist = obj.files[i].artist?obj.files[i].artist:"";
      composer = obj.files[i]['composer']?obj.files[i]['composer']:"";
      composer = artist.trim() === composer.trim()?false:composer;
      albumartist = obj.files[i]['albumartist']?obj.files[i]['albumartist']:"";
      albumartist = albumartist.trim() === artist.trim()?false:albumartist;
      album = obj.files[i]['album']?obj.files[i]['album']:"";
      year = obj.files[i]['year']?obj.files[i]['year']:"";
      genre = obj.files[i]['genre']?obj.files[i]['genre']:"";
      trackNumber = obj.files[i]['trackNumber']?obj.files[i]['trackNumber']:"";
      metastr += artist?artist + sepexp:"";
      metastr += composer?composer + sepexp:"";
      metastr += albumartist = albumartist?albumartist + sepexp:"";
      metastr += album?album + sepexp:"";
      metastr += genre?genre + sepexp:"";
      metastr += year?String(year):"";
      metastr = metastr.replace(resep,"");
      %>
   <tr class=indexrow id="<%= i + 1000%>" bgcolor=<%= i%2?"#F0F0F0":"#FFFFFF"   %>>
	<td class="playicon" ><img class="soundfile" id="<%= i %>" src="/icons/loudspeaker.svg" filename="<%- filename%>" artist="<%- artist%>" selectiontitle="<%- name%>" album="<%- album%>">
	</td>
	<td class="indexcolname hoverMeta" tabindex="0">
	  <%- name%>
          <span class="metaContent">
	    <%- metastr  %>
          </span>
	</td>

      </tr>
      <%}%>
  </tbody>
</table>
`
	    ]

if(typeof module === undefined) {} else { module.exports = { mkTempl } }
