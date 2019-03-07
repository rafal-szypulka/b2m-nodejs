#!/bin/bash
ab -k -c 100 -n 700000 http://localhost:3001/checkout &
exit 0


