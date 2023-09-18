#!/bin/bash

set -e
set -x

if [[ "$(git status --porcelain)" == "" ]]; then
  echo "No changes"
  exit 0
fi

# Branch
branch="update-$(date -u '+%Y-%m-%d')"
git checkout -b "$branch"

# Set user name and email
git config user.name github-actions
git config user.email github-actions-bot@users.noreply.github.com

# Add, commit, push
git add .
git commit -m "Update all"
git push --set-upstream origin "$branch"

# Open pull request
url="https://api.github.com/repos/$GITHUB_REPOSITORY/pulls" # GITHUB_REPOSITORY format is: OWNER/REPO
body="{\"title\": \"$branch\", \"body\": \"$branch\", \"head\": \"$branch\", \"base\": \"master\"}"
http_code="$(curl --silent --output response.json --write-out '%{http_code}' --header "Authorization: bearer $GITHUB_TOKEN" --request POST --data "$body" "$url")"
if [[ "$http_code" != "201" ]]; then
  echo "Unexpected HTTP CODE '$http_code'"
  exit 1
fi

# Print the URL
cat response.json | jq --raw-output .url
