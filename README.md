### Why?
Right way to keep configuration data safe is encrypt sensitive data like database passwords, basic auth etc.
Encryption procedure is rare (mostly only once) and most of the time manual. However decryption should be done every time on service/system startup 
That lib was build with an intention to minimize effort required for data decryption previously encrypted by KMS

### How to encrypt data using KMS and store them in your config?
First of all you need a KMS key. Here is [link](http://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html) of how to create one


Imagine you have next config file:
```
{
    "user": "foo",
    "database": "bar",
    "password": "very_secret_password"
}
```

Using aws cli you can do next
```
aws kms --region ${AWS_REGION} encrypt --key-id ${KEY_ID} --plaintext "very_secret_password" --query CiphertextBlob --output text
```

NOTE: AWS_REGION and KEY_ID should be supplied

Output of the previous command could be something like that

```
ABCNSDF...ASDA=="
```

Then you replace sensitive data in config with previously encrypted value and add "{encrypted}" prefix to it
 
```
{
    "user": "foo",
    "database": "bar",
    "password": "{encrypted}ABCNSDF...ASDA=="
}
```


### How to decrypt using kms-decryptor lib

You AWS resource (AWS lambda, EC2) where your running you NodeJS app should have access to KMS decryption 
Then using that lib inside your code jus do this:
 
```
var kmsDecryptor = require('kms-decryptor');

var config = {
     "user": "foo",
     "database": "bar",
     "password": "{encrypted}ABCNSDF...ASDA=="
}
var decryptedConfig = kmsDecryptor.setup({region: "us-west-2"}).decrypt(config);
```


Arrays values and nested object properties are also handled