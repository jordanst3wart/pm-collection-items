
var fs = require('fs'); // needed to read JSON file from disk
var crypto = require('crypto');

function readJson(path){
    return JSON.parse(fs.readFileSync(path).toString());
}

// TODO shorten hash so that file names aren't long, the risk if a hash collosion occurs is low, and the changes are low
// maybe to just 5 characters
function generateHash(json){
    return crypto.createHash('md5').update(JSON.stringify(json)).digest("hex");
}

function compare(json1,json2){
    var a = generateHash(json1);
    var b = generateHash(json2);
    return a === b;
}

function ensureDirectory(path){
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true},function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log(path + " directory successfully created.");
            }
        })
    }
}

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

module.exports = {readJson, generateHash, compare, ensureDirectory, readFilesInDir};