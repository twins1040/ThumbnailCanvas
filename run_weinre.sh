#!/bin/bash

if [ -z "$1" ]; then
  echo "error: no args. ex) ./run_weinre 10.193.6.51"
  exit
fi

weinre_host=$1


cat_script="cat mobile_test.patch"
cat_r_script="cat mobile_test_reset.patch"
sed_command="sed s/Whost/$weinre_host/"
run="patch -p0"
dry_run="$run --dry-run"

if [ "$2" == "clean" ]; then
  if $cat_r_script | $sed_command | $dry_run; then
    $cat_r_script | $sed_command | $run
  else
    echo "clean fail check git status"
    exit 1
  fi
else
  if $cat_script | $sed_command | $dry_run; then
    $cat_script | $sed_command | $run
  else
    echo "patch fail check git status"
    exit 1
  fi

  # run client server
  cd refactoring
  npm run dev &

  # run api server
  cd ..
  python manage.py runserver $weinre_host:8000
fi

