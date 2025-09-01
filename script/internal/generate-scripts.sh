#!/bin/bash

set -e

# Script dir
script_dir="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# Trace
. $script_dir/set-trace.sh

# Recreate script/generated/
target_dir="$script_dir/../generated"
rm -rf "$target_dir"
mkdir -p "$target_dir"
cd "$target_dir"

# Create each script
for json_file in $script_dir/../../config/actions/*.json; do
  json="$(cat "$json_file")"
  split=( $(echo "$json" | jq --raw-output '.owner + " " + .repo') )
  owner="${split[0]}"
  repo="${split[1]}"
  script_file="${owner}_${repo}.sh"
  echo "Generating $PWD/$script_file"

  # Append curl download command
  curl_download_commands=()

  # Get an array of branch info. Each item contains "<branch> <sha>"
  branch_info=()
  IFS=$'\n' read -r -d '' -a branch_info < <( echo "$json" | jq --raw-output '.branches | to_entries | .[] | .key + " " + .value' && printf '\0' )

  for item in "${branch_info[@]}"; do
    split=( $(echo $item) )
    branch="${split[0]}"
    sha="${split[1]}"

    # Append curl download command
    curl_download_commands+=("curl -s -S -L -o '$sha.tar.gz' 'https://api.github.com/repos/$owner/$repo/tarball/$sha'")
    curl_download_commands+=("curl -s -S -L -o '$sha.zip' 'https://api.github.com/repos/$owner/$repo/zipball/$sha'")
  done

  # Get an array of tag info. Each item contains "<tag> <commit_sha>"
  tag_info=()
  IFS=$'\n' read -r -d '' -a tag_info < <( echo "$json" | jq --raw-output '.tags | to_entries | .[] | .key + " " + .value.commit' && printf '\0' )

  for item in "${tag_info[@]}"; do
    split=( $(echo $item) )
    tag="${split[0]}"
    sha="${split[1]}"

    # Append curl download command
    curl_download_commands+=("curl -s -S -L -o '$sha.tar.gz' 'https://api.github.com/repos/$owner/$repo/tarball/$sha'")
    curl_download_commands+=("curl -s -S -L -o '$sha.zip' 'https://api.github.com/repos/$owner/$repo/zipball/$sha'")
  done

  # Append curl commands
  echo "mkdir ${owner}_$repo" >> "$script_file"
  echo "pushd ${owner}_$repo" >> "$script_file"
  for curl_download_command in "${curl_download_commands[@]}"
  do
    echo "$curl_download_command &" >> "$script_file"
  done
  echo "wait" >> "$script_file"
  echo "popd" >> "$script_file"
done
