## History

### 0.0.6 / 2014/01/23

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

The algo must be one of crypto.getHashes(). The default algo is `sha1`, if you want to change the algo, this function must call before the others.

```
// Default algo: sha1
fcmp.setAlgo('md5');
```

### checksum 


```
fcmp.checksum('path/to/file', function (err, checksum) {
    // return the checksum of file
});
```

### checksum (sync version)

```
var checksum = fcmp.checksumSync('path/to/file');

```

### compare

```
fcmp.compare('file/path/one', 'file/path/two', function (err, result) {
    // result true means the content of two files are same.
});
```

### compare (sync version)

```
var result = fcmp.compareSync('file/path/one', 'file/path/two');
```

## Test

```
npm test
```
