'use strict';

var fcmp = require('../fcmp');

var dmyOne = './test/data/dmy1',
    dmyTwo = './test/data/dmy2',
    dmyThree = './test/data/dmy3', // same as dmyOne
    dmyNotExists = './this/file/doesnt/exists';


describe('fcmp', function () {
    it('should be able to change algo', function () {
        fcmp.setAlgo('md5').should.be.true;
        fcmp.setAlgo('fake algo').should.be.false;
        fcmp.setAlgo('sha1').should.be.true;
    });

    describe('#checksumSync()', function () {
        it('should throw expection when file not exists', function () {
            (function () {
                fcmp.checksumSync(dmyNotExists);
            }).should.throwError();
        });
        it('should return checksum', function () {
            fcmp.checksumSync(dmyOne).should.be.ok
                .and.be.type('string')
                .and.have.length(40);
        });
    });

    describe('#checksum()', function () {
        it('should error when file not exists', function (done) {
            fcmp.checksum(dmyNotExists, function (err) {
                err.should.be.instanceof(Error);
                done();
            });
        });
        it('should return checksum', function (done) {
            fcmp.checksum(dmyOne, function (err, checksum) {
                (err === null).should.be.true;
                checksum.should.be.ok
                    .and.be.type('string')
                    .and.have.length(40);

                done();
            });
        });
    });

    describe('#compareSync()', function () {
        it('should throw exception when one of the file not exists', function () {
            (function () {
                var result = fcmp.compareSync(dmyOne, dmyNotExists);
            }).should.
            throw ();
        });
        it('should return false when files are different', function () {
            fcmp.compareSync(dmyOne, dmyTwo).should.be.false;
        });
        it('should return true when files are same', function () {
            fcmp.compareSync(dmyOne, dmyThree).should.be.true;
        });
    });

    describe('#compare()', function () {
        it('should throw exception when one of the file not exists', function (done) {
            fcmp.compare(dmyOne, dmyNotExists, function (err) {
                err.should.be.instanceof(Error);
                done();
            });
        });
        it('should return false when files are different', function (done) {
            fcmp.compare(dmyOne, dmyTwo, function (err, result) {
                (err === null).should.be.true;
                result.should.be.false;

                done();
            });
        });
        it('should return true when files are same', function (done) {
            fcmp.compare(dmyOne, dmyThree, function (err, result) {
                (err === null).should.be.true;
                result.should.be.true;

                done();
            });
        });
    });
});
