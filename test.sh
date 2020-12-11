#!/bin/bash
g++ code.c -o code
code=$(./code 5 10)
echo $code