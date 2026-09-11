#!/usr/bin/env bash
set -euo pipefail
# Input contract: the approved 1280x720, ten-second orange film.
input=${1:?Usage: bash scripts/prepare-orange-sequence.sh /path/to/video.mp4}
root=$(cd "$(dirname "$0")/.." && pwd)
output="$root/public/sequences/orange"
mkdir -p "$output/atlas-desktop" "$output/atlas-mobile"
for variant in desktop mobile; do
  filter='fps=18,crop=640:720:320:0'
  quality=78
  if [[ "$variant" == mobile ]]; then
    filter+=',scale=360:405:flags=lanczos'
    quality=74
  fi
  ffmpeg -y -hide_banner -loglevel error -i "$input" -t 10 -an \
    -vf "$filter,tile=4x2" -fps_mode vfr -frames:v 23 \
    -c:v libwebp -quality "$quality" -compression_level 6 -start_number 0 \
    "$output/atlas-$variant/sheet-%02d.webp"
  ffmpeg -y -hide_banner -loglevel error -i "$input" -an \
    -vf "$filter" -frames:v 1 -c:v libwebp -quality "$quality" -compression_level 6 \
    "$output/poster-$variant.webp"
done
