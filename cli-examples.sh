#!/bin/bash

# breakdown/deconstruct files
# TODO fails on something
./index.js  --breakdownCollection --inputDir resources/sample-input  --outputDir resources/sample-output

# reconstruct/construct files
./index.js  --reconstructCollection --outputDir resources/sample-input  --inputDir resources/sample-output

# assert the files are the same TODO
./index.js --assert
