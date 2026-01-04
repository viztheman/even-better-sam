#!/bin/bash
INFILE="$1"
CMUJSON="${INFILE/txt/json}"
OUTFILE="$2"

./cmu-to-json.sh "$INFILE" "$CMUJSON"
node compile-dict.js "$CMUJSON" "$OUTFILE"
rm -f "$CMUJSON"
