#!/bin/bash

# Usage: script/build.sh [ssh|https]
#   ssh        Force SSH clone URLs
#   https      Force HTTPS clone URLs

set -e

# Script dir
script_dir="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# Trace
. $script_dir/internal/set-trace.sh

while test $# -gt 0; do
  case "$1" in
    -no-verify)
      NO_VERIFY=1;
      shift
      ;;
    *)
      # Protocol is the only unnamed arg
      protocol="$1"
      shift;
      ;;
  esac
done

# validate protocol input and set default arg
# need to do this here because the above loop doesn't run ifthere are no args
protocol="$(echo "$protocol" | tr a-z A-Z)"
if [ -z "$protocol" ]; then
  # Note:
  # - Use "-o" instead of "--only-matching" for compatibility
  # - Use "-F" instead of "--fixed-strings" for compatibility
  if [ -n "$( (git remote get-url origin | grep -o -F 'git@github.com:') || : )" ]; then
    protocol='SSH'
  else
    protocol='HTTPS'
  fi
elif [ "$protocol" != 'HTTPS' -a "$protocol" != 'SSH' ]; then
  echo "Invalid protocol '$protocol'. Expected 'https' or 'ssh'."
  exit 1
fi

# validate sha256sum tool is installed to check runner SHA's
if ! command -v sha256sum &> /dev/null && [ -z "$NO_VERIFY" ]
then
    echo "sha256sum tool not installed, you may need to 'brew install coreutils or pass in -no-verify'"
    exit 1
fi

# Generate action scripts
if [ -z "$GENERATE_ACTION_SCRIPTS" ]; then
  "$script_dir/internal/generate-scripts.sh"
elif [ "$GENERATE_ACTION_SCRIPTS" != "0" ]; then
  echo "Unexpected arg GENERATE_ACTION_SCRIPTS value '$GENERATE_ACTION_SCRIPTS'"
  exit 1
fi

# Minimum git version
$script_dir/internal/check-git.sh

# Recreate _layout
layout_dir="$script_dir/../_layout"
rm -rf "$layout_dir"
mkdir -p "$layout_dir"

# Remote URL prefix
url_prefix='git@github.com:'
if [ $protocol = 'HTTPS' ]; then
  url_prefix='https://github.com/'
fi

# Use checked-in known_hosts, dont check IP
if [ "$protocol" = 'SSH' ]; then
  export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=yes -o CheckHostIP=no -o UserKnownHostsFile=$script_dir/internal/known_hosts"
fi

# Create each repo
pushd "$layout_dir"
for action_script in $script_dir/generated/*.sh; do
  . $action_script
done
popd

# List the repositories
cd $layout_dir
echo 'Created repos:'
for repo in ./*; do
  echo "$PWD/$repo"
done
