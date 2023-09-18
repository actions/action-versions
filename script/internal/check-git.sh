#!/bin/sh

# Lowest version tested against :)
expected_major=2
expected_minor=11

if [ -z "$(which git || exit 0)" ]; then
  echo "Unable to find 'git' in the PATH"
  exit 1
fi

# Get <major>.<minor>
# Note:
# - Use "-o" instead of "--only-matching" for compatibility
# - Use "-E" instead of "--extended-regexp" for compatibility
major_minor=$(git --version | grep -o -E '[0-9]+\.[0-9]+')
if [ -z "$major_minor" ]; then
  echo "Unable to determine git version. Expected output of 'git --version' to contain a version, for example '2.1'"
  exit 1
fi

major=$(echo "$major_minor" | grep -o -E '^[0-9]+')
minor=$(echo "$major_minor" | grep -o -E '[0-9]+$')

# Higher major version
if [ $major -gt $expected_major ]; then
  exit 0
fi

# Lower major version
if [ $major -lt $expected_major ]; then
  echo "Git $expected_major.$expected_minor or higher must be in the PATH"
  exit 1
fi

# Lower minor version
if [ $minor -lt $expected_minor ]; then
  echo "Git $expected_major.$expected_minor or higher must be in the PATH"
  exit 1
fi
