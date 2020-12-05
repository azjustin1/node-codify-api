#!/bin/bash
compiler=$1
codeFile=$2
inputFile=$3
outputFile=$4
if [ "$compiler" = "g++" ]; then
    $($compiler /temp/$codeFile -o ./temp/$outputFile)
    if [ $? -eq 0 ]; then
        echo $(./temp/$outputFile</temp/$inputFile)
    fi
else
    echo $($compiler temp/$codeFile<temp/$inputFile)
fi
