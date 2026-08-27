#!/usr/bin/bash
IFS=$'\n'
n=`ls "$1"/*[f.][lmM][ap4P][c3aA]`;

if [ $? -gt 0 ]; then
  echo "[]"
  exit 0
fi

str="";space=" ";
for i in $n ;
do
    str=$str${i// /\\ }$space  ;
#    echo $i;
done;
str=${str//\(/\\\(};
str=${str//\)/\\\)};
str=${str//\&/\\\&};
str=${str//\!/\\\!};
str=${str//\'/\\\'};
str=${str//\`/\\\`};
str=${str//\;/\\\;};
str=${str//</\\\<};
str=${str//\>/\\\>};
str=${str//\#/\\\#};
str=${str//\]/\\\]};
str=${str//\[/\\\[};

str=mediainfo$space--Inform=\"General\;file://inform.txt\"$space$str;
captured_output=$(eval $str);
massaged=${captured_output%?};
echo \[$massaged\]
