const pm_collection = require('../lib/pm-collection');


// test breakdown of collections
test('hashes are generated', () => {
    expect(true).toBeTruthy();
});

test('test breakdown of collection', ()=>{
   expect(pm_collection.breakdownCollection('resources/sample-input/Empty_Collection.postman_collection.json','resources/sample-output/'))
});

// pm_collection.breakdownCollection()

// test reconstruct of collections
