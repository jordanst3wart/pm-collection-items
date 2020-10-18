// TODO read all items, and write to file
// write all itemGroups with reference to items
// compare items to other items to see if they are similar
// if similar re-use the single item as reference

// items
// itemGroups[references of items]
// collection[references of itemGroups, and items]

var Collection = require("postman-collection").Collection;
var fs = require('fs'); // needed to read JSON file from disk
var ItemGroup = require('postman-collection').ItemGroup;
var crypto = require('crypto');
var mPath = require('path');

function breakdownCollection(collectionPath) {
// Load a collection to memory from a JSON file on disk (say, sample-collection.json)
    var myCollection = new Collection(readJson(collectionPath));
    var members = myCollection["items"]["members"];
    nameList2 = [];
    members.forEach((member => {
        var nameList = [];
        member["items"]["members"].forEach((item => {
            itemWithoutIds = removeKeys(item.toJSON(), ["id"]);
            var hash = generateHash(itemWithoutIds);
            name = 'items/' + item["name"].replace(/ /g, "-") + "." + hash + ".json";


            fs.writeFileSync(name, JSON.stringify(itemWithoutIds, null, 2));
            nameList.push(name)
        }))
        member["item"] = nameList;


        memberWithoutIds = removeKeys(member.toJSON(), ["id"]);
        var hash = generateHash(memberWithoutIds);
        name = 'itemGroups/' + member["name"].replace(/ /g, "-") + "." + hash + ".json";
        fs.writeFileSync(name, JSON.stringify(memberWithoutIds, null, 2));
        nameList2.push(name);
    }))

    myCollection["item"] = nameList2;

    collectionWithoutIds = removeKeys(myCollection.toJSON(), ["id","postman_id","_postman_id"]);
    var hash = generateHash(collectionWithoutIds);
    name = 'collections/' + myCollection["name"].replace(/ /g, "-") + "." + hash + ".json";
    fs.writeFileSync(name, JSON.stringify(collectionWithoutIds, null, 2));
    return name;
}

// reconstructed
function reconstructCollection(collectionPath) {
    var shortenedCollection = readJson(collectionPath);
    var filename = mPath.parse(collectionPath).base;

    newItemGroups = [];
    shortenedCollection["item"].map((member1 => {
        item1 = readJson(member1);
        newItemGroups.push(item1);

        newItems = []
        item1["item"].map((member2) => {
            item2 = readJson(member2);
            newItems.push(item2);
        })
        item1["item"] = newItems;
    }))

    shortenedCollection["item"] = newItemGroups;

    name = "reconstructed/CIAM_internet_TPP_Initiated_Consent_Revocation.json"
    fs.writeFileSync(name, JSON.stringify(shortenedCollection, null, 2));
}

function assertTransform(initialPath, reconstructedPath) {
    function genHashFromPath(path){
        var data = readJson(path);
        data = removeKeys(data, ["id","postman_id","_postman_id"]);
        return generateHash(data);
    }
    var data = new Collection(readJson(initialPath));
    data = removeKeys(data.toJSON(),["id","postman_id","_postman_id"]);
    var initialHash = generateHash(data);
    var reconstructedHash = genHashFromPath(reconstructedPath);
    if(initialHash===reconstructedHash && initialHash !== undefined){
        console.log("Round trip succeeded.")
    } else {
        console.log("Round trip failed.")
    }
    //fs.writeFileSync("file1.json", JSON.stringify(item.toJSON(), null, 2));
    console.log(initialHash)
}

// from: https://gist.github.com/aurbano/383e691368780e7f5c98
function removeKeys(obj, keys) {
    //console.log(typeof keys);
    keys.map((key => {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                switch (typeof (obj[prop])) {
                    case 'object':
                        if (key.indexOf(prop) > -1) {
                            obj[prop] = undefined;
                        } else {
                            obj[prop] = removeKeys(obj[prop], [key]);
                        }
                        break;
                    default:
                        if (key.indexOf(prop) > -1) {
                            obj[prop] = undefined;
                        }
                        break;
                }
            }
        }
        return obj;
    }))
    return obj;
}

function readJson(path){
    return JSON.parse(fs.readFileSync(path).toString());
}

function generateHash(json){
    return crypto.createHash('md5').update(JSON.stringify(json)).digest("hex");
}

function compare(json1,json2){
    var a = generateHash(json1);
    var b = generateHash(json2);
    return a === b;
}

//console.log(removeKeys({"a":{"hi":"hi"},"b":"hello"},["a"]));
var path = breakdownCollection('CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json');
console.log(path);
reconstructCollection(path);
assertTransform('CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json','reconstructed/CIAM_internet_TPP_Initiated_Consent_Revocation.json');

// TODO test recosntructed can be loaded into Newman, and Postman

// Tests for remove keys:
/*
obj = {"a":{"hi":"hi"},"b":"hello"};
result = removeKeys(obj,["a"])
console.log(compare(result,{'b':"hello"}));

// Tests for remove keys:
obj = {"c":{"a":"hi"},"b":"hello"};
result = removeKeys(obj,["a"])
console.log(compare(result,{'c': {},'b':"hello"}));

// Tests for remove keys:
obj = {"c":{"a":"hi","b":"could"},"b":"hello"};
result = removeKeys(obj,["b"])
console.log(result);
console.log(compare(result,{'c': {'a':"hi"}}));

// Tests for remove keys:
obj = {"c":{"a":"hi","b":"could"},"b":"hello"};
result = removeKeys(obj,["z","b"])
console.log(result);
console.log(compare(result,{'c': {'a':"hi"}}));
*/
