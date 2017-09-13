var AWS         = require('aws-sdk');
var should  = require('should');
var path        = require('path');
var nocks       = require(path.resolve('./test/nocks'));
var subject     = require(path.resolve('./lib'));

describe('kms-decryptor', () => {

        it('should be able decrypt encrypted values', () => {

            nocks.kmsResponseOk(4);
            var data = {
                "array": ["abc", 1, "{encrypted}test"],
                "encrypted": "{encrypted}test",
                "plain": "HIG",
                "number": 1,
                "boolean": false,
                "nested_object": {
                    "some_data": "plain",
                    "some_encrypted_data": "{encrypted}test",
                    "boolean": true,
                    "number": 2
                },
                "super_array": [
                    { "encrypted": "{encrypted}test"},
                    { "plain": "text" }
                ]
            }

            return subject.setup({region: "us-west-2"}).decrypt(data)
                .then(data => {
                    data.should.deepEqual({
                        "array": ["abc", 1, "decrypted"],
                        "encrypted": "decrypted",
                        "plain": "HIG",
                        "number": 1,
                        "boolean": false,
                        "nested_object": {
                            "some_data": "plain",
                            "some_encrypted_data": "decrypted",
                            "boolean": true,
                            "number": 2
                        },
                        "super_array": [
                            { "encrypted": "decrypted"},
                            { "plain": "text" }
                        ]
                    });
                });
        });

        it('should fail on bad response from KMS', () => {
            nocks.kmsResponse403();
            return subject.setup({region: "us-west-2"}).decrypt({"test":"{encrypted}data"})
                .then(() => { throw new Error('Expected to fail')})
                .catch((error) => {
                    error.should.be.instanceof(Error)
                    error.message.should.equal("Can't decode data. Error UnknownError: null");
                    return false;
                });
        })
});