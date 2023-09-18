#!/bin/bash

if [ -z "$(which node || exit 0)" ]; then
  echo "Unable to find 'node' in the PATH"
  exit 1
fi

node_version=$(node --version | grep --only-matching --extended-regexp 'v[0-9]+' | tr -d 'v')
if [ -z "$node_version" ]; then
  echo "Unable to determine node version. Expected output of 'node --version' to contain a version, for example 'v12.13.1'"
  exit 1
fi

if [ $node_version -lt 12 ]; then
  echo "Node 12 or higher must be in the PATH"
  exit 1
fi
