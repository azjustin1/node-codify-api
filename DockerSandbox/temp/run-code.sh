#!/bin/bash
compiler=$1
codeFile=$2
inputFile=$3
outputFile=$4
TIMEFORMAT=%R

start=$(date +%s)
if [ "$compiler" = "g++" ]; then
    $($compiler /temp/$codeFile -o ./temp/$outputFile)
    if [ $? -eq 0 ]; then
        echo $(./temp/$outputFile</temp/$inputFile)
        
    fi
else
    $($compiler temp/$codeFile<temp/$inputFile)
    if [ $? -eq 0 ]; then
        echo $($compiler temp/$codeFile<temp/$inputFile)
    fi
fi
end=$(date +%s)

runtime=$((($end-$start)*1000))
echo $runtime







