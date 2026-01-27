 IFS=$'\n' n=`cat /tmp/appleadds.1`;for i in $n;do bn=`basename $i`;nn=${bn// /}; echo $i  $nn.1.json; `/home/bill/applaiz/fsObj.js -p $i > $nn.1.json`  ;  done
