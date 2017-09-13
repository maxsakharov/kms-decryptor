var nock = require('nock');

exports.kmsResponseOk = (times) => {
    return nock('https://kms.us-west-2.amazonaws.com:443/')
        .post('/')
        .times(times || 1)
        .reply(200, {"Plaintext": Buffer('decrypted', 'ascii')});
}

exports.kmsResponse403 = (times) => {
    return nock('https://kms.us-west-2.amazonaws.com:443/')
        .post('/')
        .times(times || 1)
        .reply(403, {"Plaintext": Buffer('decrypted', 'ascii')});
}