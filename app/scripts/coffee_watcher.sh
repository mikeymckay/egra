#!/usr/bin/env sh

# Script will watch the current working folder every $interval seconds for changes (modifications,
# deletions, additions and do something cool if a change is detected. By default it will always
# run once on start
watch=`pwd`
interval="1"
verbose="0"
if [ $verbose -eq "1" ] ;then echo "Watching: $watch"; fi

echo "" > "/tmp/coffee.watch.base"
while [ true ]
do
  if [ $verbose -eq "1" ] ;then echo "Scanning for changes"; fi
  find "$watch" -type f -name "*.coffee" | xargs ls -al > "/tmp/coffee.watch.current"
  diff "/tmp/coffee.watch.base" "/tmp/coffee.watch.current" > /dev/null
  if [ $? -gt 0 ] ;then
    if [ $verbose -eq "1" ] ;then echo "Found change"; fi
    cp "/tmp/coffee.watch.current" "/tmp/coffee.watch.base"
    coffee -c -b -o "$watch" "$watch"
  fi
  sleep $interval
done


