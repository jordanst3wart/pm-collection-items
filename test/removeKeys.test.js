// Tests for remove keys:
const removeKeys = require('../lib/removeKeys');

var obj;
var result;

test('Objects are removed', () => {
    obj = {"a":{"hi":"hi"},"b":"hello"};
    result = removeKeys(obj,["a"])
    expect(result).toEqual({"b":"hello"});
});

test('Empty object are generated', () => {
    obj = {"c":{"a":"hi"},"b":"hello"};
    result = removeKeys(obj,["a"])
    expect(result).toEqual({'c': {},'b':"hello"});
});

test('Nested keys are removed', () => {
    obj = {"c":{"a":"hi","b":"could"},"b":"hello"};
    result = removeKeys(obj,["b"])
    expect(result).toEqual({'c': {'a':"hi"}});
});

test('Test removing multiple keys', () => {
    obj = {"c":{"a":"hi","b":"could"},"b":"hello"};
    result = removeKeys(obj,["z","b"])
    expect(result).toEqual({'c': {'a':"hi"}});
});

test('Test removing multiple keys 2', () => {
    obj = {"c":{"a":"hi","b":"could", "z":"fine"},"b":"hello"};
    result = removeKeys(obj,["z","b"])
    expect(result).toEqual({'c': {'a':"hi"}});
});
