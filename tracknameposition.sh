IFS=$'\n';
for i in {139..164}; do
    s="";
    name="Pristine Player V2($i).flac"
    n=`mediainfo $DIR/$name`;
    for q in $n; do
	if [[ $q == *Track* ]];then
	   s="$q$s";
	fi;
    done;
    out=$(echo $s|perl -pe "s/Track name//g;s/\/Position\s+\://;s/\/Total\s+\:\s\d\d\s//;s/\s+\://;s/^\s+//;")
    command="/usr/bin/ffmpeg -hide_banner -i \"$DIR/$name\" -ab 320k  \"$out.mp3\""
    #command=$(echo $command|perl -pe "s/\(/\\\(/g;s/\)/\\\)/g;")
    echo $command
    #r=`/usr/bin/ffmpeg -i \'$DIR/$name\' -ab 320k  \"$out.mp3\"`
done
