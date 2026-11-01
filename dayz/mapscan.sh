#!/bin/sh
# Runs a local DayZ server with mapscan_init.c and saves the dump to scan/<map>.txt.gz (input for build_data.py).
# Usage: ./mapscan.sh nasdara
#        MISSION=regular.namalsk MODS='@namalsk_island;@namalsk_survival' ./mapscan.sh namalsk
#        MISSION=dayzOffline.enoch ./mapscan.sh livonia
# MISSION is a folder in <server>/mpmissions (default dayzOffline.<map>), SERVER defaults to ~/dayzserver.
set -eu
MAP=$1
MISSION=${MISSION:-dayzOffline.$MAP}
WORLD=${MISSION##*.}  # the engine loads the world named after the mission folder suffix
SRV=${SERVER:-$HOME/dayzserver}
HERE=$(cd "$(dirname "$0")" && pwd)
SCAN="$SRV/mpmissions/mapscan.$WORLD"

rm -rf "$SCAN" "$SRV/mapscan-profile"
cp -r "$SRV/mpmissions/$MISSION" "$SCAN"
cp "$HERE/mapscan_init.c" "$SCAN/init.c"
cat > "$SRV/mapscan.cfg" <<EOF
hostname = "mapscan";
password = "$(head -c 12 /dev/urandom | base64 | tr -dc a-zA-Z0-9)";
maxPlayers = 1;
instanceId = 1;
BattlEye = 0;
class Missions { class DayZ { template = "mapscan.$WORLD"; }; };
EOF

cd "$SRV"
# The script calls RequestExit when done (~1 min); on a script error the server keeps running until the timeout.
timeout 300 ./DayZServer -config=mapscan.cfg -profiles=mapscan-profile -port=2402 -dologs ${MODS:+"-mod=$MODS"} || true
if ! grep -q '^end' mapscan-profile/mapscan.txt 2>/dev/null; then  # the engine writes CRLF line endings
    cat mapscan-profile/crash_*.log 2>/dev/null
    echo "scan failed, logs in $SRV/mapscan-profile" >&2
    exit 1
fi
mkdir -p "$HERE/scan"
gzip -9c mapscan-profile/mapscan.txt > "$HERE/scan/$MAP.txt.gz"
echo "saved scan/$MAP.txt.gz"
