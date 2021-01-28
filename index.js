#!/usr/bin/env node
'use strict';

// write all itemGroups with reference to items
// compare items to other items to see if they are similar
// if similar re-use the single item as reference

// items
// itemGroups[references of items]
// collection[references of itemGroups, and items]
const helpers = require('./lib/helpers');
const pm_collection = require('./lib/pm-collection');

const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');


const parser = new ArgumentParser({
    description: 'Argparse for postman-collection-items'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-r', '--reconstructCollection', { help: 'Reconstructs collections in ___ dir', action: "store_true" });
parser.add_argument('-b','--breakdownCollection', { help: 'Breaks down collections in ___ dir', action: "store_true" });
parser.add_argument('-a','--assertTransform', { help: 'Asserts the collections can be broken down and reconstructed via matching the hash', action: "store_true" });
parser.add_argument('-t','--roundTrip', { help: 'Runs breakdown, reconstruct, and assert', action: "store_true" });
//parser.add_argument('-f','--file', { help: 'Breaks down a single collection in __ dir, rather than all of them' });
parser.add_argument('-i','--inputDir', { help: 'Input directory', required: true });
parser.add_argument('-o','--outputDir', { help: 'Output directory', required: true });
let args = parser.parse_args();




// if single file use that as a list
// else get all files
// get files
let pathReconstruct;
let pathBreakdown = [];
let inputFiles;

if(args["reconstructCollection"]){
    // TODO don't hardcode /collections
    inputFiles = helpers.readFilesInDir(args["inputDir"] + "/collections");
} else {
    inputFiles = helpers.readFilesInDir(args["inputDir"]);
}

if(inputFiles.length === 0){
    console.log("No files selected...")
}

// TODO ensure no trailing "/" in paths
if(args["breakdownCollection"]){
    inputFiles.map(path => {
        pathBreakdown.push(pm_collection.breakdownCollection(path, args["outputDir"]));
    })
}

if(args["reconstructCollection"]){
    inputFiles.map(path => {
        pathBreakdown.push(pm_collection.reconstructCollection(path, args["outputDir"]));
    })
}

if(args["assertTransform"]){
    // runBreakdown=true; assumes they will already be broken down
    pathReconstruct = pm_collection.reconstructCollection(pathBreakdown);
    pm_collection.assertTransform('input/CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json', pathReconstruct);
}

if(args["roundTrip"]){
    // runBreakdown=true; assumes they will already be broken down
    inputFiles.map(path => {
        pathBreakdown.push(pm_collection.breakdownCollection(path, args["outputDir"]));
    })
    pathBreakdown.map(path =>{
        pathReconstruct = pm_collection.reconstructCollection(path, args["inputDir"]);
    })

    // TODO change function
    pm_collection.assertTransform(pathBreakdown, pathReconstruct);
}



