#!/bin/sh
# RepMile V1 parallel fronts (audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md §9): the connected iPhone is ONE
# exclusive resource. Every command that installs, launches or tests on the physical device runs through this wrapper, so two sessions never
# use the device at once.
#
# The exclusion is a KERNEL lock (flock) on a descriptor that the command itself inherits: the wrapper takes the lock and then exec()s the
# command in the same process, so the lock lives exactly as long as the command and its children, survives the death of any wrapper, and
# is released by the kernel when they exit or die. There is no stale lock to reclaim and so no reclaim race. The owner file is information
# for `status` only. Local builds and simulator/macOS tests do NOT need it.
#
#   tools/device-lock/with-device.sh <coachinghost|healthkit|integration> [--wait] -- <command...>
#   tools/device-lock/with-device.sh status
#
# Exit 75 (EX_TEMPFAIL): the device is held by another session (without --wait). Otherwise the command's own exit code.
set -eu
DIR="${REPMILE_DEVICE_LOCK:-$HOME/Library/Caches/repmile/device.lock}"
mkdir -p "$DIR"
export WD_LOCKFILE="$DIR/lock" WD_OWNER="$DIR/owner"

held() { /usr/bin/perl -e 'use Fcntl qw(:flock); open(my $f, ">>", $ENV{WD_LOCKFILE}) or exit 2; exit(flock($f, LOCK_EX|LOCK_NB) ? 1 : 0)'; }
status() { if held; then echo "device HELD:"; sed 's/^/  /' "$WD_OWNER" 2>/dev/null || echo "  (no owner information)"; else echo "device FREE"; fi; }

if [ "${1:-}" = "status" ]; then status; exit 0; fi
SESSION="${1:-}"; shift || true
case "$SESSION" in coachinghost|healthkit|integration) ;; *) echo "usage: $0 <coachinghost|healthkit|integration> [--wait] -- <command...>" >&2; exit 64;; esac
export WD_SESSION="$SESSION" WD_WAIT=0
if [ "${1:-}" = "--wait" ]; then WD_WAIT=1; shift; fi
[ "${1:-}" = "--" ] && shift
[ $# -gt 0 ] || { echo "no command given" >&2; exit 64; }

# $^F = 255 keeps the lock descriptor open across exec (Perl marks descriptors above $^F close-on-exec).
exec /usr/bin/perl -e '
  use Fcntl qw(:flock); use POSIX qw(strftime);
  $^F = 255;
  open(my $f, ">>", $ENV{WD_LOCKFILE}) or die "with-device: cannot open the lock: $!\n";
  unless (flock($f, $ENV{WD_WAIT} ? LOCK_EX : LOCK_EX|LOCK_NB)) {
    print STDERR "with-device: the iPhone is in use\n";
    if (open(my $o, "<", $ENV{WD_OWNER})) { print STDERR map { "  $_" } <$o> }
    exit 75;
  }
  if (open(my $o, ">", $ENV{WD_OWNER})) {
    printf $o "session=%s\npid=%d\nstarted=%s\ncommand=%s\n", $ENV{WD_SESSION}, $$, strftime("%Y-%m-%dT%H:%M:%SZ", gmtime), $ARGV[0]; close $o;
  }
  exec { $ARGV[0] } @ARGV or do { print STDERR "with-device: cannot run $ARGV[0]: $!\n"; exit 127 };
' "$@"
