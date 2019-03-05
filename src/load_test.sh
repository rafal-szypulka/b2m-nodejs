#!/bin/bash
ab -k -c 100 -n 200000 http://localhost:3001/ &
ab -k -c 100 -n 700000 http://localhost:3001/checkout &
ab -k -c 5 -n 1000 http://localhost:3001/bad &
exit 0


