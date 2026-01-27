IFS=$'\n' n=`cat /tmp/appleadds.1`;for i in $n;do echo $i; dn=`dirname $i`; echo $dn ;  `scp -pr -i ~/.ssh/bill-key1  $i acercx12:/mnt/share/home/bill/applaiz/$dn`; done 
