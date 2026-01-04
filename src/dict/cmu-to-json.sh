#!/bin/bash
INFILE="$1"
OUTFILE="$2"

echo "{" >"$OUTFILE"

tr -d '\r' <"$INFILE" |
    grep -Ea "^[A-Za-z][A-Za-z']{2,} " |
    sort |
    sed 's@  @\t@' |
    sed 's@ @@g' |
    tr '0' '4' |
    tr '1' '5' |
    tr '2' '6' |
    awk '{print "\""$1"\": \""$2"\",";}' >>"$OUTFILE"

echo "}" >>"$OUTFILE"
sed -i ':a;N;$!ba;s/,\n}/\n}/g' "$OUTFILE"
