#!/usr/bin/env node
'use strict';

// write all itemGroups with reference to items
// compare items to other items to see if they are similar
// if similar re-use the single item as reference

// items
// itemGroups[references of items]
// collection[references of itemGroups, and items]
const helpers = require('./lib/helpers');
const removeKeys = require('./lib/removeKeys');

const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');
var Collection = require("postman-collection").Collection;
var fs = require('fs'); // needed to read JSON file from disk
var mPath = require('path');


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
var args = parser.parse_args();

function ensureDirectory(path){
    if (!fs.existsSync(path)) {
        fs.mkdir(path, {recursive: true},function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log(path + " directory successfully created.");
            }
        })
    }
}

function breakdownCollection(collectionPath, outputPath) {
    var name;
// Load a collection to memory from a JSON file on disk (say, sample-collection.json)
    var myCollection = new Collection(helpers.readJson(collectionPath));
    var members = myCollection["items"]["members"];
    var nameList2 = [];
    members.forEach((member => {
        var nameList = [];
        member["items"]["members"].forEach((item => {
            var itemWithoutIds = removeKeys(item.toJSON(), ["id"]);
            var hash = helpers.generateHash(itemWithoutIds);
            name = outputPath + '/items/' + item["name"].replace(/ /g, "-") + "." + hash + ".json";
            ensureDirectory(outputPath +'/items');
            fs.writeFileSync(name, JSON.stringify(itemWithoutIds, null, 2));
            nameList.push(name)
        }))
        member["item"] = nameList;


        var memberWithoutIds = removeKeys(member.toJSON(), ["id"]);
        var hash = helpers.generateHash(memberWithoutIds);
        name = outputPath + '/itemGroups/' + member["name"].replace(/ /g, "-") + "." + hash + ".json";
        ensureDirectory(outputPath +'/itemGroups');
        fs.writeFileSync(name, JSON.stringify(memberWithoutIds, null, 2));
        nameList2.push(name);
    }))

    myCollection["item"] = nameList2;

    var collectionWithoutIds = removeKeys(myCollection.toJSON(), ["id","postman_id","_postman_id"]);
    var hash = helpers.generateHash(collectionWithoutIds);
    name = outputPath + '/collections/' + myCollection["name"].replace(/ /g, "-") + "." + hash + ".json";
    ensureDirectory(outputPath);
    fs.writeFileSync(name, JSON.stringify(collectionWithoutIds, null, 2));
    return name;
}

// reconstructed
function reconstructCollection(collectionPath, outputPath) {
    var shortenedCollection = helpers.readJson(collectionPath);
    var filename = mPath.parse(collectionPath).base;

    var newItemGroups = [];
    shortenedCollection["item"].map((member1 => {
        var item1 = helpers.readJson(member1);
        newItemGroups.push(item1);

        var newItems = []
        item1["item"].map((member2) => {
            var item2 = helpers.readJson(member2);
            newItems.push(item2);
        })
        item1["item"] = newItems;
    }))

    shortenedCollection["item"] = newItemGroups;

    var filenameSplit = filename.split('.')
    var path = outputPath + "/" + filenameSplit[0] + "." + filenameSplit[2];
    fs.writeFileSync(path, JSON.stringify(shortenedCollection, null, 2));
    return path;
}

function assertTransform(initialPath, reconstructedPath) {
    function genHashFromPath(path){
        var data = helpers.readJson(path);
        data = removeKeys(data, ["id","postman_id","_postman_id"]);
        return helpers.generateHash(data);
    }
    var data = new Collection(helpers.readJson(initialPath));
    data = removeKeys(data.toJSON(),["id","postman_id","_postman_id"]);
    var initialHash = helpers.generateHash(data);
    var reconstructedHash = genHashFromPath(reconstructedPath);
    if(initialHash===reconstructedHash && initialHash !== undefined){
        console.log("Round trip succeeded.");
    } else {
        console.log("Round trip failed.");
        console.log("InitialHash: " + initialHash);
        console.log("reconstructedHash: " + reconstructedHash);
    }
    //fs.writeFileSync("file1.json", JSON.stringify(item.toJSON(), null, 2));
}


// if single file use that as a list
// else get all files
// get files
var pathReconstruct;
var pathBreakdown = [];

//var currentPath = process.cwd()
function readFilesInDir(path){
    var filePaths = [];
    fs.readdirSync(path).map(file => {
        var stats = fs.statSync(path + "/" + file);
        if(stats.isFile()){
            filePaths.push(path + "/" + file);
        }
    });
    return filePaths;
}

if(args["reconstructCollection"]){
    // TODO don't hardcode /collections
    var inputFiles = readFilesInDir(args["inputDir"] + "/collections");
} else {
    var inputFiles = readFilesInDir(args["inputDir"]);
}

if(inputFiles.length === 0){
    console.log("No files selected...")
}

// TODO ensure no trailing "/" in paths
if(args["breakdownCollection"]){
    console.log(inputFiles);
    inputFiles.map(path => {
        pathBreakdown.push(breakdownCollection(path, args["outputDir"]));
    })
}

if(args["reconstructCollection"]){
    inputFiles.map(path => {
        pathBreakdown.push(reconstructCollection(path, args["outputDir"]));
    })
}

if(args["assertTransform"]){
    // runBreakdown=true; assumes they will already be broken down
    pathReconstruct = reconstructCollection(pathBreakdown);
    assertTransform('input/CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json', pathReconstruct);
}

if(args["roundTrip"]){
    // runBreakdown=true; assumes they will already be broken down
    inputFiles.map(path => {
        pathBreakdown.push(breakdownCollection(path, args["outputDir"]));
    })
    pathBreakdown.map(path =>{
        pathReconstruct = reconstructCollection(path, args["inputDir"]);
    })

    // TODO change function
    assertTransform(pathBreakdown, pathReconstruct);
}



