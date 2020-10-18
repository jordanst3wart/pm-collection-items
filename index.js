// TODO read all items, and write to file
// write all itemGroups with reference to items
// compare items to other items to see if they are similar
// if similar re-use the single item as reference

// items
// itemGroups[references of items]
// collection[references of itemGroups, and items]

var Collection = require("postman-collection").Collection;
var deepEqual = require("deep-equal");

var fs = require('fs'); // needed to read JSON file from disk
//var Collection = require('postman-collection').Collection;
var ItemGroup = require('postman-collection').ItemGroup;


var crypto = require('crypto');

// http://www.postmanlabs.com/postman-collection/

// Load a collection to memory from a JSON file on disk (say, sample-collection.json)
var myCollection = new Collection(JSON.parse(fs.readFileSync('CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json').toString()));

var members = myCollection["items"]["members"];

function removeKeys(obj, keys) {
    for (var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            switch(typeof(obj[prop])) {
                case 'object':
                    if(keys.indexOf(prop) > -1) {
                        delete obj[prop];
                    } else {
                        removeKeys(obj[prop], keys);
                    }
                    break;
                default:
                    if(keys.indexOf(prop) > -1) {
                        delete obj[prop];
                    }
                    break;
            }
        }
    }
    return obj;
}

nameList2 = [];

members.forEach((member => {
    //console.log(member);
    var nameList = [];
    member["items"]["members"].forEach((item =>{
        itemWithoutIds = removeKeys(item.toJSON(),"id");
        var hash = crypto.createHash('md5').update(JSON.stringify(itemWithoutIds)).digest("hex");
        name = 'items/' + item["name"].replace(/ /g,"-") + "." +hash + ".json";


        fs.writeFileSync(name, JSON.stringify(item.toJSON(),null,2));
        nameList.push(name)
    }))
    member["item"] = nameList;


    memberWithoutIds = removeKeys(member.toJSON(),"id");
    var hash = crypto.createHash('md5').update(JSON.stringify(memberWithoutIds)).digest("hex");
    name = 'itemGroups/' + member["name"].replace(/ /g,"-") + "." + hash + ".json";
    fs.writeFileSync(name, JSON.stringify(member.toJSON(),null,2));
    nameList2.push(name);
}))

myCollection["item"]=nameList2;

collectionWithoutIds = removeKeys(myCollection.toJSON(),"id");
collectionWithoutIds = removeKeys(collectionWithoutIds,"postman_id");
collectionWithoutIds = removeKeys(collectionWithoutIds,"_postman_id");
var hash = crypto.createHash('md5').update(JSON.stringify(collectionWithoutIds)).digest("hex");
name = 'collections/' + myCollection["name"].replace(/ /g,"-") + "." + hash + ".json";
fs.writeFileSync(name, JSON.stringify(myCollection.toJSON(),null,2));


// reconstructed
var shortenedCollection = JSON.parse(fs.readFileSync('collections/CIAM_internet_TPP_Initiated_Consent_Revocation.20a3322ca5c5c8575acb608a399cee86.json').toString());

newItemGroups = [];
//console.log(shortenedCollection["items"][0]);
shortenedCollection["item"].map((member1 => {
    item1 = JSON.parse(fs.readFileSync(member1).toString());
    newItemGroups.push(item1);

    newItems = []
    item1["item"].map((member2) => {
        item2 = JSON.parse(fs.readFileSync(member2).toString());
        newItems.push(item2);
    })
    item1["item"]=newItems;
}))

shortenedCollection["item"]= newItemGroups;
console.log(newItemGroups);

name = "reconstructed/CIAM_internet_TPP_Initiated_Consent_Revocation.json"
fs.writeFileSync(name, JSON.stringify(shortenedCollection,null,2));

var myCollection2 = new Collection(JSON.parse(fs.readFileSync('CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json').toString()));
shortenedCollection2 = removeKeys(myCollection2,"id");
shortenedCollection2 = removeKeys(shortenedCollection2,"postman_id");
shortenedCollection2 = removeKeys(shortenedCollection2,"_postman_id");

shortenedCollection = removeKeys(shortenedCollection,"id");
shortenedCollection = removeKeys(shortenedCollection,"postman_id");
shortenedCollection = removeKeys(shortenedCollection,"_postman_id");
var hash1 = crypto.createHash('md5').update(JSON.stringify(shortenedCollection2)).digest("hex");
var hash2 = crypto.createHash('md5').update(JSON.stringify(shortenedCollection)).digest("hex");
fs.writeFileSync("file1.json", JSON.stringify(shortenedCollection2,null,2));
fs.writeFileSync("file2.json", JSON.stringify(shortenedCollection,null,2));
console.log(hash1);
console.log(hash2);





