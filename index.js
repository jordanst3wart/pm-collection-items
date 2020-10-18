// TODO read all items, and write to file
// write all itemGroups with reference to items
// compare items to other items to see if they are similar
// if similar re-use the single item as reference

// items
// itemGroups[references of items]
// collection[references of itemGroups, and items]

var Collection = require("postman-collection").Collection;
const assert = require('assert').strict;

var fs = require('fs'); // needed to read JSON file from disk
//var Collection = require('postman-collection').Collection;
var ItemGroup = require('postman-collection').ItemGroup;


var crypto = require('crypto');

// http://www.postmanlabs.com/postman-collection/


function removeKeys(obj, keys) {
    for (var key in keys) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                switch (typeof (obj[prop])) {
                    case 'object':
                        if (key.indexOf(prop) > -1) {
                            delete obj[prop];
                        } else {
                            removeKeys(obj[prop], key);
                        }
                        break;
                    default:
                        if (key.indexOf(prop) > -1) {
                            delete obj[prop];
                        }
                        break;
                }
            }
        }
    }
    return obj;
}

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


            fs.writeFileSync(name, JSON.stringify(item.toJSON(), null, 2));
            nameList.push(name)
        }))
        member["item"] = nameList;


        memberWithoutIds = removeKeys(member.toJSON(), ["id"]);
        var hash = generateHash(memberWithoutIds);
        name = 'itemGroups/' + member["name"].replace(/ /g, "-") + "." + hash + ".json";
        fs.writeFileSync(name, JSON.stringify(member.toJSON(), null, 2));
        nameList2.push(name);
    }))

    myCollection["item"] = nameList2;

    collectionWithoutIds = removeKeys(myCollection.toJSON(), ["id","postman_id","_postman_id"]);
    var hash = generateHash(collectionWithoutIds);
    name = 'collections/' + myCollection["name"].replace(/ /g, "-") + "." + hash + ".json";
    fs.writeFileSync(name, JSON.stringify(myCollection.toJSON(), null, 2));
}
breakdownCollection('CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json');

// reconstructed
function reconstructCollection(collectionPath) {
    var shortenedCollection = readJson(collectionPath);

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

reconstructCollection('collections/CIAM_internet_TPP_Initiated_Consent_Revocation.20a3322ca5c5c8575acb608a399cee86.json');

function assertTransform(initialPath, reconstructedPath) {
    function genHashFromPath(path){
        var data = readJson(path);
        data = removeKeys(data);
        return generateHash(data, ["id","postman_id","_postman_id"]);
    }
    var initialHash = genHashFromPath(initialPath);
    var reconstructedHash = genHashFromPath(reconstructedPath);
    if(initialHash===reconstructedHash){
        console.log("Round trip succeeded.")
    } else {
        console.log("Round trip failed.")
    }
}

function readJson(path){
    return JSON.parse(fs.readFileSync(path).toString());
}

function generateHash(json){
    crypto.createHash('md5').update(JSON.stringify(json)).digest("hex");
}

assertTransform('CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json','reconstructed/CIAM_internet_TPP_Initiated_Consent_Revocation.json');

// TODO test recosntructed can be loaded into Newman, and Postman



