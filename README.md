## History

### 0.0.8 / 2014/01/23

* quick fix for missing callback check

### 0.0.5 / 2014/01/23

* add support for massive file comparsion (async version)
* improve async performance
* prevent callback undefined


## Getting started

### install

```
npm install fcmp
```

## Usage

require fcmp:

```
var fcmp = require('fcmp');
```

### setAlgo

The algorithm must be one of crypto.getHashes(). The default algorithm is `sha1`, if you want to change the algorithm, this function should call before the others.

```
// Default algorithm: sha1
fcmp.setAlgo('md5');
```

### checksum 


```
fcmp.checksum('path/to/file', function (err, checksum) {
    // return the checksum of file
});
```

### checksumSync

```
var checksum = fcmp.checksumSync('path/to/file');

```

### compare

```
fcmp.compare('file/path/one', 'file/path/two', function (err, result) {
    // result: true - means the content of two files are same.
});
```

### compareSync

```
var result = fcmp.compareSync('file/path/one', 'file/path/two');
```

## Test

```
npm test
```
