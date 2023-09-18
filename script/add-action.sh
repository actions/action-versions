#!/bin/bash

set -e

script_dir="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# Minimum node version
$script_dir/internal/check-node.sh

# Minimum git version
$script_dir/internal/check-git.sh

# Add the action
node "$script_dir/internal/add-action.js" $*

# Regenerate action scripts
$script_dir/internal/generate-scripts.sh
