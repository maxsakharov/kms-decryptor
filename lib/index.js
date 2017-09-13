const DEFAULT_REGION = "us-east-1";

var AWS     = require('aws-sdk');
var Promise = require('bluebird');
var kms = new AWS.KMS()

module.exports.decrypt = (obj) => {
    if (typeof obj === 'string' && obj.startsWith('{encrypted}')) {
        obj = obj.replace(/^(\{encrypted\})/, "");
        var params = {
            CiphertextBlob: Buffer(obj, 'base64')
        };
        return kms.decrypt(params).promise()
            .then(decrypted => {
                return decrypted.Plaintext.toString('ascii');
            })
            .catch(err => {
                throw new Error("Can't decode " + obj + ". Error " + err);
            });
    } else if (obj instanceof Array) {
        return Promise.all(obj)
            .each((el, idx) => {
                return this.decrypt(el)
                    .then(decrypted => {
                        obj[idx] = decrypted;
                        return decrypted;
                    });
            })
            .then(() => { return obj; });
    } else if (obj instanceof Object) {
        return Promise.all(Object.keys(obj))
            .each(key => {
                return this.decrypt(obj[key])
                    .then(decrypted => {
                        obj[key] = decrypted;
                        return decrypted;
                    });
            })
            .then(() => { return obj; });
    } else {
        return Promise.resolve(obj);
    }
}

module.exports.setup = (config) => {
    config = config || {};
    kms = new AWS.KMS({region: config.region || DEFAULT_REGION});
    return this;
}