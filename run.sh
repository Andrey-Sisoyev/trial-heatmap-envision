#!/bin/bash

echo "Running \"`basename ${0}`\"."
old_dir=`pwd`
cd `dirname ${0}`

export HOME_SRC_HWE="/home/master/Projects/nodejs/helloworld-express"

iced --compile --output build/ src/

node build/app.js

cd $old_dir
echo "Finished \"`basename ${0}`\"."
