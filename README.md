# fcmp
[![Build Status](https://travis-ci.org/raylin/fcmp.png)](https://travis-ci.org/raylin/fcmp) 
[![Dependency Status](https://david-dm.org/raylin/fcmp/dev-status.svg)](https://david-dm.org/raylin/fcmp)
[![Coverage Status](https://coveralls.io/repos/github/raylin/fcmp/badge.svg?branch=master)](https://coveralls.io/github/raylin/fcmp?branch=master)
[![npm version](https://img.shields.io/npm/v/fcmp.svg)](https://www.npmjs.com/package/fcmp)
[![npm downloads](https://img.shields.io/npm/dm/fcmp.svg)](https://www.npmjs.com/package/fcmp)
[![npm license](https://img.shields.io/npm/l/fcmp.svg)](http://magicdawn.mit-license.org)

## History

### 1.0.1 / 2016/03/10
* some API naming

### 1.0.0 / 2016/03/03
* change to new API
* can handle variable argument
* take glob string or Stream as input

### 0.2.0 / 2016/02/26
* remove checksum function and focuse on files comparsion
* change from callback-style to promise
* support multi arguments
* rewrite in ES6

### 0.1.0 / 2014/01/24
* remove file validation, handle the exceptions yourself
    + checksumSync() and compareSync(): throw exception when file not exists
    + checksum() and compare(): get err in callback function 

* remove dependency: lodash


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

#### require fcmp:
```javascript
var fcmp = require('fcmp');
```

#### areEqual:
```javascript
fcmp('/test/file/**/*.png', '/test/file2/a.png', pngReadStream).areEqual()
.then(function(equal) {...})
// result is Boolean shows whether these files have the same content.
```

#### getChecksums:
```javascript
fcmp('/test/file/**/*.png', './test/file/*.jpg').getChecksums()
.then(function(checksums) {...})
// result gives a object with filename and hash pairs.
```

#### getDuplicates:
```javascript
fcmp('/test/file/**/*.png').getDuplicates()
.then(function(duplicateFiles) {...})
// result is nested arrays, 
```

## Test

```
npm test
```
