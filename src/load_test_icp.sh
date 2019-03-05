#!/bin/bash
ab -k -c 100 -n 20000 http://172.16.251.6:32605/ &
ab -k -c 100 -n 70000 http://172.16.251.6:32605/checkout &
ab -k -c 5 -n 1000 http://172.16.251.6:32605/bad &
exit 0
