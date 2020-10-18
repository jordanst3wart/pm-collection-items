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

//var data = "do shash'owania";
//var hash = crypto.createHash('md5').update(data).digest("hex");
//console.log(hash);

// http://www.postmanlabs.com/postman-collection/

// Load a collection to memory from a JSON file on disk (say, sample-collection.json)
var myCollection = new Collection(JSON.parse(fs.readFileSync('CIAM_internet_TPP_Initiated_Consent_Revocation.postman_collection.json').toString()));

// log items at root level of the collection
// console.log(myCollection)
var members = myCollection["items"]["members"];

//normalised_json_data = JSON.stringify(object_to_sign)
//signature=md5(normalised_json_data)

//
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
//jsonCollection = myCollection.toJSON()
//collectionWithNoIds = removeKeys(jsonCollection,"id");
//fs.writeFileSync('noid.json', JSON.stringify(collectionWithNoIds,null,2));

//console.log(items["members"]);
/*var i;
for (i = 0; i < cars.length; i++) {
    text += cars[i];
}*/
// console.log(items);

/*

{
  "hash":
  "path":
}

 */

//var item = items["members"][0];
//console.log(items["members"]);
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
    member["items"] = nameList;


    memberWithoutIds = removeKeys(member.toJSON(),"id");
    var hash = crypto.createHash('md5').update(JSON.stringify(memberWithoutIds)).digest("hex");
    name = 'itemGroups/' + member["name"].replace(/ /g,"-") + "." + hash + ".json";
    fs.writeFileSync(name, JSON.stringify(member.toJSON(),null,2));
    nameList2.push(name);
}))

myCollection["items"]=nameList2;
console.log(myCollection);
name = 'collections/' + myCollection["name"].replace(/ /g,"-") + ".json";
fs.writeFileSync(name, JSON.stringify(myCollection.toJSON(),null,2));


