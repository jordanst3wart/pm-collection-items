
var fs = require('fs'); // needed to read JSON file from disk
var crypto = require('crypto');

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

module.exports = {readJson, generateHash, compare};