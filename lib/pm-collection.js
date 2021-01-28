const helpers = require('./helpers');
const removeKeys = require('./removeKeys');
var Collection = require("postman-collection").Collection;
var fs = require('fs'); // needed to read JSON file from disk
var mPath = require('path');


// TODO i should change the collection to be a data structure rather than a path
function breakdownCollection(collectionPath, outputPath) {
    var name;
// Load a collection to memory from a JSON file on disk (say, sample-collection.json)
    var myCollection = new Collection(helpers.readJson(collectionPath));
    var members = myCollection["items"]["members"];
    var nameList2 = [];
    members.forEach((member => {
        var nameList = [];
        if ("items" in member){
            member["items"]["members"].forEach((item => {
                var itemWithoutIds = removeKeys(item.toJSON(), ["id"]);
                var hash = helpers.generateHash(itemWithoutIds);
                // TODO might not need to replace things with a '-'
                name = outputPath + '/items/' + item["name"].replace(/ /g, "-") + "." + hash + ".json";
                helpers.ensureDirectory(outputPath + '/items');
                fs.writeFileSync(name, JSON.stringify(itemWithoutIds, null, 2));
                nameList.push(name)
            }))
            member["item"] = nameList;
        }


        var memberWithoutIds = removeKeys(member.toJSON(), ["id"]);
        var hash = helpers.generateHash(memberWithoutIds);
        name = outputPath + '/itemGroups/' + member["name"].replace(/ /g, "-") + "." + hash + ".json";
        helpers.ensureDirectory(outputPath + '/itemGroups');
        fs.writeFileSync(name, JSON.stringify(memberWithoutIds, null, 2));
        nameList2.push(name);
    }))

    myCollection["item"] = nameList2;

    var collectionWithoutIds = removeKeys(myCollection.toJSON(), ["id","postman_id","_postman_id"]);
    var hash = helpers.generateHash(collectionWithoutIds);
    name = outputPath + '/collections/' + myCollection["name"].replace(/ /g, "-") + "." + hash + ".json";
    helpers.ensureDirectory(outputPath + '/collections');
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

        if ("items" in item1) {
            var newItems = []
            item1["item"].map((member2) => {
                var item2 = helpers.readJson(member2);
                newItems.push(item2);
            })
            item1["item"] = newItems;
        }
    }))

    shortenedCollection["item"] = newItemGroups;

    var filenameSplit = filename.split('.')
    var path = outputPath + "/" + filenameSplit[0] + ".postman_collection" + "." + filenameSplit[2];
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

module.exports = {breakdownCollection, reconstructCollection, assertTransform};