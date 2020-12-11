#!/bin/bash
temp=$1
compiler=$2
codeFile=$3
inputFile=$4
outputFile=$5
docker run --rm -i -v $temp:/temp compiler sh temp/run-code.sh $compiler $codeFile $inputFile $outputFile
