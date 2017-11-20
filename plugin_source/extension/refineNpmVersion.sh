#!/bin/sh
find . -iname "package.json" |xargs perl -pi -e "s/\"version\": \"([\w\/:\-\.]+)\"/\"version\":\"0\.1\.0\"/gi"
