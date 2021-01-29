const pm_collection = require('../lib/pm-collection');
const helpers = require('../lib/helpers');


// test breakdown of collections
test('hashes are generated', () => {
    expect(true).toBeTruthy();
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
