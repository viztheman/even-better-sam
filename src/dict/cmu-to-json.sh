#!/bin/bash
INFILE="$1"
OUTFILE="$2"

tr -d '\r' <"$INFILE" |
    grep -Ea "^[A-Za-z][A-Za-z']{2,} " |
    sort |
    sed -E "s:\s+:\t:" |
    sed -E 's:[ ]::g' |
    tr '0' '4' |
    tr '1' '5' |
    tr '2' '6' >intermediate.txt

cut -f 1 intermediate.txt >keys.txt

cut -f 2 intermediate.txt |
    sed -E "s:H{2,}:H:g" |
    sed -E "s:JH:J:g" |
    sed -E "s:^H:/H:" >values.txt

echo '{' >$OUTFILE

paste keys.txt values.txt |
    awk '{print "\""$1"\": \""$2"\",";}' >>$OUTFILE

sed -i '$s/,$//' $OUTFILE
echo '}' >>$OUTFILE

rm -f intermediate.txt keys.txt values.txt
