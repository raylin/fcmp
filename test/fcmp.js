'use strict';

var fcmp = require('../fcmp');

var dmyOne = './test/data/dmy1',
    dmyTwo = './test/data/dmy2',
    dmyThree = './test/data/dmy3'; // same as dmyOne

describe('fcmp', function () {
    it('should be able to change algo', function () {
        fcmp.setAlgo('md5').should.be.true;
        fcmp.setAlgo('fake algo').should.be.false;
        fcmp.setAlgo('sha1').should.be.true;
    });

    describe('#sync', function () {
        it('should checksum not exists file return null', function () {
            (fcmp.checksumSync('./path/not/exists') === null).should.be.true;
        });

        it('should checksum return hash', function () {
            fcmp.checksumSync(dmyOne).should.be.ok
                .and.be.type('string')
                .and.equal('d50679bd9ce0a8371c8b4be6390a6c8d9c59780e');
        }); 
        
        it('should compare not exists file return false', function () {
            fcmp.compareSync(dmyOne, './file/not/exists').should.be.false;
        });

        it('should compare different files return false', function () {
            fcmp.compareSync(dmyOne, dmyTwo).should.be.false;     
        });

        it('should compare same files return true', function () {
            fcmp.compareSync(dmyOne, dmyThree).should.be.true;
        });
    });

    describe('#async', function () {
        it('should checksum not exists file get error', function (done) {
            fcmp.checksum('./path/not/exists', function (err, checksum) {
                err.should.be.instanceof(Error);
                (checksum === null).should.be.true;

                done();
            });
        });

        it('should checksum return hash', function (done) {
            fcmp.checksum(dmyOne, function (err, checksum) {
                (err === null).should.be.true;
                checksum.should.be.ok
                    .and.be.type('string')
                    .and.equal('d50679bd9ce0a8371c8b4be6390a6c8d9c59780e');

                done();
            });
        }); 

        it('should compare not exists file get error and return false', function (done) {
            fcmp.compare(dmyOne, './file/not/exists', function (err, comparsion) {
                err.should.be.instanceof(Error);
                (comparsion === null).should.be.false;

                done();
            });
        });

        it('should compare different files return false', function (done) {
            fcmp.compare(dmyOne, dmyTwo, function (err, comparsion) {
                (err === null).should.be.true;
                comparsion.should.be.false;

                done();
            });
        });

        it('should compare same files return true', function (done) {
            fcmp.compare(dmyOne, dmyThree, function (err, comparsion) {
                (err === null).should.be.true;
                comparsion.should.be.true;

                done();
            }); 
        });
    });
});
