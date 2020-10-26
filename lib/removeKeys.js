// modified from: https://gist.github.com/aurbano/383e691368780e7f5c98
function removeKeys(obj, keys) {
    //console.log(typeof keys);
    keys.map((key => {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                switch (typeof (obj[prop])) {
                    case 'object':
                        if (key.indexOf(prop) > -1) {
                            obj[prop] = undefined;
                        } else {
                            obj[prop] = removeKeys(obj[prop], [key]);
                        }
                        break;
                    default:
                        if (key.indexOf(prop) > -1) {
                            obj[prop] = undefined;
                        }
                        break;
                }
            }
        }
        //return obj;
    }))
    return obj;
}

module.exports = removeKeys;