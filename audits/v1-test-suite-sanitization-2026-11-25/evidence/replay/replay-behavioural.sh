#!/bin/zsh
# NOTE: links node_modules. Valid for behavioural tests only; a link is an UNTRACKED file to the record verifiers, so record tests were replayed with replay-records.sh (a copy).
# usage: run.sh <commit>   — replay the 29 failing test files at a historical commit
W=$REPO
S=$SCRATCH
c=$1; d=$S/hist/wt-$c
[ -f $S/hist/$c.xml ] && exit 0
git -C $W worktree add --detach -q $d $c >/dev/null 2>&1 || exit 1
ln -s $W/CoachingCore/node_modules $d/CoachingCore/node_modules
files=()
for f in $(cat $S/failfiles.txt); do [ -f $d/CoachingCore/test/$f ] && files+=(test/$f); done
if (( ${#files} )); then
  (cd $d/CoachingCore && node --test --test-reporter=junit --test-reporter-destination=$S/hist/$c.xml $files >/dev/null 2>&1)
else echo '<testsuites/>' > $S/hist/$c.xml; fi
git -C $W worktree remove --force $d
