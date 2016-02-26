# fcmp
[![Build Status](https://travis-ci.org/raylin/fcmp.png)](https://travis-ci.org/raylin/fcmp) [![Dependency Status](https://david-dm.org/raylin/fcmp/dev-status.svg)](https://david-dm.org/raylin/fcmp)


## History

### 0.2.0 / 2016/02/26
* remove checksum function and focuse on files comparsion
* change callback-style to promise
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

require fcmp:

```
var fcmp = require('fcmp');
```

## Test

```
npm test
```
