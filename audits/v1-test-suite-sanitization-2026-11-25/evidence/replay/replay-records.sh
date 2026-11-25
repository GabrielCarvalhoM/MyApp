#!/bin/zsh
# usage: run.sh <commit>   — replay the 29 failing test files at a historical commit
W=$REPO
S=$SCRATCH
c=$1; d=$S/hist2/wt-$c
[ -f $S/hist2/$c.xml ] && exit 0
git -C $W worktree add --detach -q $d $c >/dev/null 2>&1 || exit 1
cp -R $W/CoachingCore/node_modules $d/CoachingCore/node_modules
files=()
for f in $(cat $S/recfiles.txt); do [ -f $d/CoachingCore/test/$f ] && files+=(test/$f); done
if (( ${#files} )); then
  (cd $d/CoachingCore && node --test --test-reporter=junit --test-reporter-destination=$S/hist2/$c.xml $files >/dev/null 2>&1)
else echo '<testsuites/>' > $S/hist2/$c.xml; fi
git -C $W worktree remove --force $d
