const pm_collection = require('../lib/pm-collection');
const helpers = require('../lib/helpers');

test('test depth of an item', ()=>{
    let data = {itemList: [], itemNameSet: new Set()};
    let item = helpers.readJson('test/resources/item.json');
    let retData = pm_collection.extractData(item, data, 2);
    expect(retData['itemList'][0].depth).toBe(2);
});

test('test name of an item', ()=>{
    let data = {itemList: [], itemNameSet: new Set()};
    let item = helpers.readJson('test/resources/item.json');
    let retData = pm_collection.extractData(item, data, 2);
    expect(retData['itemList'][0]['name']).toBe('Enroll Google Authenticator Factor');
});

test('test data of an item', ()=>{
    let data = {itemList: [], itemNameSet: new Set()};
    let item = helpers.readJson('test/resources/item.json');
    let retData = pm_collection.extractData(item, data, 2);
    expect(retData['itemList'][0]['data']).toStrictEqual(helpers.readJson('test/resources/item.json'));
});

test('test name in set', ()=>{
    let data = {itemList: [], itemNameSet: new Set()};
    let item = helpers.readJson('test/resources/item.json');
    let retData = pm_collection.extractData(item, data, 2);
    expect(retData.itemNameSet.has('Enroll Google Authenticator Factor')).toBeTruthy();
});

test('test extracting data of an item', ()=>{
    let data = {itemList: [], itemNameSet: new Set()};
    let item = helpers.readJson('test/resources/item.json');
    let expectedSet = new Set();
    expectedSet.add('Enroll Google Authenticator Factor');
    let expected = { itemList: [{name: 'Enroll Google Authenticator Factor', data:{},depth: 2}], itemNameSet: expectedSet };
    console.log(pm_collection.extractData(item, data, 2));
    expect(pm_collection.extractData(item, data, 2));
});



test('test extracting data of an itemList', ()=>{
    expect(pm_collection.extractData());
});

test('test extracting data of a collection', ()=>{
    expect(pm_collection.extractData());
});

test('test breakdown of collection', ()=>{
    helpers.readJson('')
   expect(pm_collection.breakdownCollection('resources/sample-input/Empty_Collection.postman_collection.json','resources/sample-output/'))
});

/*test('test breakdown of collection', ()=>{
    expect(pm_collection.breakdownCollection('resources/sample-input/Restful_Booker_Collection.postman_collection.json','resources/sample-output/'))
});*/

// pm_collection.breakdownCollection()

// test reconstruct of collections
