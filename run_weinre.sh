#!/bin/bash

clean=false
weinre_host=$(ifconfig wifi0 | grep 'inet ' | sed 's/^ *//' | cut -d' ' -f 2)

while getopts di: option
do
case "${option}"
in
d) clean=true;;
i) weinre_host=${OPTARG};;
esac
done

cat_script="cat mobile_test.patch"
cat_r_script="cat mobile_test_reset.patch"
sed_command="sed s/Whost/$weinre_host/"
run="patch -p0"
dry_run="$run --dry-run"

echo "ip adress: $weinre_host"
if $clean; then
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

