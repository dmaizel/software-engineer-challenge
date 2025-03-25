#!/bin/sh

curl -v -X POST -H "X-ing-format: access-log" -H "Content-Type: text-plain"  -d "@$1" http://localhost:8080/
