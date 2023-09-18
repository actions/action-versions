#!/bin/sh

GITHUB_ACTIONS_DEBUG="$(echo "$GITHUB_ACTIONS_DEBUG" | tr a-z A-Z)"
if [ "$GITHUB_ACTIONS_DEBUG" = 'TRUE' -o "$GITHUB_ACTIONS_DEBUG" = '1' ]; then
  set -x
fi
