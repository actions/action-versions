#!/bin/bash

# Usage: script/test.sh ./_layout/action-versions.[tar.gz|zip]
#        Verify the archive is well-formed with an action.[yaml|yml]

set -e

test_archive=$1

# Script dir
script_dir="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# Trace
. $script_dir/internal/set-trace.sh

# Check file exists
if [[ ! -f $test_archive ]];  then
  echo "File $test_archive does not exist."
  exit 1
fi

function test_tar_gz ()
{
    echo "testing .tar.gz ..."
    test_dir=$(dirname $test_archive)/_test_tar_gz
    rm -rf "$test_dir"
    mkdir "$test_dir"

    test_archive_full_path=$(realpath "$test_archive")
    
    pushd "$test_dir"
    tar xzf "$test_archive_full_path"

    for file in $(find . -name '*.tar.gz'); do
      echo $file
      commit_sha=$(basename "$file" ".tar.gz")
      rm -rf $commit_sha
      mkdir $commit_sha
      
      sha_archive_full_path=$(realpath "$file")
      pushd $commit_sha
      tar xzf "$sha_archive_full_path"
      all_fs_items=(*)
      first_dir="${all_fs_items[0]}"
      if [[ -f "$first_dir/action.yml" ]]; then
        echo "Find action.yml under $sha_archive_full_path"
      elif [[ -f "$first_dir/action.yaml" ]]; then
        echo "Find action.yaml under $sha_archive_full_path"
      else
        echo "$sha_archive_full_path doesn't contain an action.yml or action.yaml"
        exit 1
      fi
      popd
    done
    popd
}

function test_zip ()
{
    echo "testing .zip ..."
    test_dir=$(dirname $test_archive)/_test_zip
    rm -rf "$test_dir"
    mkdir "$test_dir"

    test_archive_full_path=$(realpath "$test_archive")
    
    pushd "$test_dir"
    unzip -q "$test_archive_full_path"

    for file in $(find . -name '*.zip'); do
      echo $file
      commit_sha=$(basename "$file" ".zip")
      rm -rf $commit_sha
      mkdir $commit_sha
      
      sha_archive_full_path=$(realpath "$file")
      chmod u+r "$sha_archive_full_path"
      pushd $commit_sha
      unzip -q "$sha_archive_full_path"
      all_fs_items=(*)
      first_dir="${all_fs_items[0]}"
      if [[ -f "$first_dir/action.yml" ]]; then
        echo "Find action.yml under $sha_archive_full_path"
      elif [[ -f "$first_dir/action.yaml" ]]; then
        echo "Find action.yaml under $sha_archive_full_path"
      else
        echo "$sha_archive_full_path doesn't contain an action.yml or action.yaml"
        exit 1
      fi
      popd
    done
    popd
}

echo "Checking file $test_archive..."
file_name=$(basename "$test_archive")
file_ext=${file_name##*.}

echo "File extension is $file_ext"

case $file_ext in
    "gz") test_tar_gz;;
    "zip") test_zip;;
    *) echo "Invalid input file, $test_archive should be a zip or tar.gz file." ; exit 1;;
esac
