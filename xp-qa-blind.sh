#!/bin/bash
PORT=$1
X=$(grep '^X=' /tmp/xp-mapping.txt | cut -d= -f2)
Y=$(grep '^Y=' /tmp/xp-mapping.txt | cut -d= -f2)
node xp-qa.tmp.mjs "http://127.0.0.1:$PORT/$X" X 2>/dev/null | sed 's/"tag":"X"/"page":"X"/'
node xp-qa.tmp.mjs "http://127.0.0.1:$PORT/$Y" Y 2>/dev/null | sed 's/"tag":"Y"/"page":"Y"/'
