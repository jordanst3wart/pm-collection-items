const helpers = require('./helpers');
const removeKeys = require('./removeKeys');
let Collection = require("postman-collection").Collection;
let fs = require('fs'); // needed to read JSON file from disk
let mPath = require('path');

// Iterator
function crawlData(member, flattenedData, depth){
    // flatten data
    let data;
    if ("items" in member){
        data = {itemList: [], itemNameSet: new Set()}
        member["items"]["members"].forEach((item => {
            data = crawlData(item, flattenedData, depth + 1)
            data = {itemList: itemList, itemNameSet: nameSet}
        }))
    } else {
        data = extractData(member, itemList, nameSet, depth)
    }
    return flattenedData;
}

function getItemsFromCollection(member){
    let flattenedData = {}
    return crawlData(member, flattenedData, 0)
}

function extractData(item, itemList, nameSet, depth){
    // this could error
    let itemWithoutIds = removeKeys(item.toJSON(), ["id","postman_id","_postman_id"]);
    if (nameSet.has(item["name"])){
        let hash = helpers.generateHash(itemWithoutIds);
        name = item["name"] + "." + hash;
    } else {
        name = item["name"]
    }
    nameSet.add(name)
    itemList.push({"name": name,
        "data": itemWithoutIds,
        "depth": depth
    })
    return {itemList: itemList, itemNameSet: nameSet}
}

// might be generic
function writeItemsToFS(itemList, outputPath){
    itemList.forEach((item => {
        helpers.ensureDirectory(outputPath + '/items');
        fs.writeFileSync(outputPath + '/items' + item["name"] + ".json", JSON.stringify(item["data"], null, 2));
    }))
}

// TODO i should change the collection to be a data structure rather than a path
function breakdownCollection(collectionPath, outputPath) {
    let name;
// Load a collection to memory from a JSON file on disk (say, sample-collection.json)
    let myCollection = new Collection(helpers.readJson(collectionPath));
    getItemsFromCollection(myCollection)

    return "hi";

    let members = myCollection["items"]["members"];
    let nameList2 = [];
    members.forEach((member => {
        let itemData = getItemsFromCollection(member)
        writeItemsToFS(itemData["itemList"], outputPath)
        member["item"] = itemData["itemNameSet"]; // I shouldn't mutate the existing data structure

        let memberWithoutIds = removeKeys(member.toJSON(), ["id"]);
        let hash = helpers.generateHash(memberWithoutIds);
        name = outputPath + '/itemGroups/' + member["name"].replace(/ /g, "-") + "." + hash + ".json";
        helpers.ensureDirectory(outputPath + '/itemGroups');
        fs.writeFileSync(name, JSON.stringify(memberWithoutIds, null, 2));
        nameList2.push(name);
    }))

    myCollection["item"] = nameList2; // I shouldn't mutate the existing data structure

    let collectionWithoutIds = removeKeys(myCollection.toJSON(), ["id","postman_id","_postman_id"]);
    let hash = helpers.generateHash(collectionWithoutIds);
    name = outputPath + '/collections/' + myCollection["name"].replace(/ /g, "-") + "." + hash + ".json";
    helpers.ensureDirectory(outputPath + '/collections');
    fs.writeFileSync(name, JSON.stringify(collectionWithoutIds, null, 2));
    return name;
}

// reconstructed
function reconstructCollection(collectionPath, outputPath) {
    let shortenedCollection = helpers.readJson(collectionPath);
    let filename = mPath.parse(collectionPath).base;

    let newItemGroups = [];
    shortenedCollection["item"].map((member1 => {
        let item1 = helpers.readJson(member1);
        newItemGroups.push(item1);

        if ("items" in item1) {
            let newItems = []
            item1["item"].map((member2) => {
                let item2 = helpers.readJson(member2);
                newItems.push(item2);
            })
            item1["item"] = newItems;
        }
    }))

    shortenedCollection["item"] = newItemGroups;

    let filenameSplit = filename.split('.')
    let path = outputPath + "/" + filenameSplit[0] + ".postman_collection" + "." + filenameSplit[2];
    fs.writeFileSync(path, JSON.stringify(shortenedCollection, null, 2));
    return path;
}

function assertTransform(initialPath, reconstructedPath) {
    function genHashFromPath(path){
        let data = helpers.readJson(path);
        data = removeKeys(data, ["id","postman_id","_postman_id"]);
        return helpers.generateHash(data);
    }
    let data = new Collection(helpers.readJson(initialPath));
    data = removeKeys(data.toJSON(),["id","postman_id","_postman_id"]);
    let initialHash = helpers.generateHash(data);
    let reconstructedHash = genHashFromPath(reconstructedPath);
    if(initialHash===reconstructedHash && initialHash !== undefined){
        console.log("Round trip succeeded.");
    } else {
        console.log("Round trip failed.");
        console.log("InitialHash: " + initialHash);
        console.log("reconstructedHash: " + reconstructedHash);
    }
    //fs.writeFileSync("file1.json", JSON.stringify(item.toJSON(), null, 2));
}

module.exports = {breakdownCollection, reconstructCollection, assertTransform};