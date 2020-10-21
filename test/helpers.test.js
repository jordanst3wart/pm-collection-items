const helpers = require('../lib/helpers');



test('hashes are generated', () => {
    expect(helpers.generateHash(["a"])).toBeDefined();
    expect(helpers.generateHash({"a":"hi"})).toBeDefined();
});