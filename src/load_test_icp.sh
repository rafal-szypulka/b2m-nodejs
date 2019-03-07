#!/bin/bash
ab -k -c 100 -n 700000 ${1}/checkout &
exit 0


