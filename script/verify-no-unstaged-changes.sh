#!/bin/bash

set -e
set -x

if [[ "$(git status --porcelain)" != "" ]]; then
    git status
    git diff
    echo "::error::Unstaged changes detected. Locally try running: script/build.sh"
    exit 1
fi
