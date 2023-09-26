#!/bin/bash

# Usage: script/build.sh

set -e

# Script dir
script_dir="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# Trace
. $script_dir/internal/set-trace.sh

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
url_prefix='https://github.com/'

# Create each repo
pushd "$layout_dir"
for action_script in $script_dir/generated/*.sh; do
  . $action_script
done
popd

# List the repositories
pushd "$layout_dir"
echo 'Created repos:'
for repo in ./*; do
  echo "$PWD/$repo"
done
popd

# Split the layout into zip vs. tar.gz
zipball_layout_dir="$script_dir/../_layout_zipball"
rm -rf "$zipball_layout_dir"
tarball_layout_dir="$script_dir/../_layout_tarball"
rm -rf "$tarball_layout_dir"

cp -r "$layout_dir" "$zipball_layout_dir"
pushd "$zipball_layout_dir"
find . -type f -name "*.tar.gz" -delete
ls -l -R ./
echo "Creating action-versions zipball in ${zipball_layout_dir}"
pwsh -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Unrestricted -Command "Compress-Archive -Path \"${zipball_layout_dir}\\*\" -DestinationPath \"${layout_dir}\action-versions.zip\""
popd

cp -r "$layout_dir" "$tarball_layout_dir"
pushd "$tarball_layout_dir"
find . -type f -name "*.zip" -delete
ls -l -R ./
echo "Creating action-versions tarball in ${tarball_layout_dir}"
pushd "$layout_dir"
tar -czf "action-versions.tar.gz" -C "${tarball_layout_dir}" .
popd
popd

