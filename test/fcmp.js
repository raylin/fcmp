'use strict';

import {createReadStream} from 'fs';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import fcmp from '../dist/fcmp';

chai.should();
chai.use(chaiAsPromised);

const MOCK_FILES = Object.freeze(
  new Map()
  .set('1', {
    file: './test/mock_files/1',
    sha1: '56e21aeb132bff61ec0b39dab24d7ae446e3046a'
  })
  .set('2', {
    file: './test/mock_files/1_copy1',
    sha1: '56e21aeb132bff61ec0b39dab24d7ae446e3046a'
  })
  .set('3', {
    file: './test/mock_files/1_copy2',
    sha1: '56e21aeb132bff61ec0b39dab24d7ae446e3046a'
  })
  .set('4', {
    file: './test/mock_files/2',
    sha1: 'da1610c86cf0fb3f89cdea3c83bfe15f2fd2e3f6'
  })
  .set('5', {
    file: './test/mock_files/3',
    sha1: '9fb00d06a8fbe298827a3ca7cbbb7e021e1b6204'
  })
  .set('6', {
    file: './test/mock_files/3_copy1',
    sha1: '9fb00d06a8fbe298827a3ca7cbbb7e021e1b6204'
  })
);

describe('fcmp', () => {
  describe('#options', () => {
    it('should get sha1 as default algorithm', () => {
      expect(fcmp.options.algorithm).to.be.equal('sha1');
    });

    it('should be able to change algorithm', () => {
      let newAlgo = 'md5';
      fcmp.options.algorithm = newAlgo;

      expect(fcmp.options.algorithm).to.be.equal(newAlgo);
    });

    it('should not change to unsupport algorithm', () => {
      let orgAlgo = fcmp.options.algorithm;
      let newAlgo = 'algoUnsupported';
      fcmp.options.algorithm = newAlgo;

      expect(fcmp.options.algorithm).not.to.be.equal(newAlgo);
      expect(fcmp.options.algorithm).to.be.equal(orgAlgo);
    });
  });

  describe('#areEqual', () => {
    it('should fail with wrong type arguments', done => {
      let wrontArg = 1234;

      fcmp(wrontArg).areEqual().should.be.rejected.and.notify(done);
    });

    it('should fail when no file resolved', done => {
      let nonExistentFile = '/A/NON/EXISTENT/FILE';

      fcmp(
        nonExistentFile
      ).areEqual().should.be.rejected.and.notify(done);
    });

    it('should pass if part of source could not resolved', done => {
      let nonExistentFile = '/A/NON/EXISTENT/FILE';

      fcmp(
        nonExistentFile,
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('4').file
      ).areEqual().should.be.fulfilled.and.notify(done);
    });

    it('should be the same - glob', done => {
      fcmp('./test/mock_files/1*').areEqual()
      .should.eventually.equal(true).and.notify(done);
    });

    it('should be the same - multi globs', done => {
      fcmp(
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('2').file,
        MOCK_FILES.get('3').file
      ).areEqual().should.eventually.equal(true).and.notify(done);
    });

    it('should be the same - glob + stream', done => {
      fcmp(
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('3').file,
        createReadStream(MOCK_FILES.get('1').file),
        createReadStream(MOCK_FILES.get('2').file)
      ).areEqual().should.eventually.equal(true).and.notify(done);
    });

    it('should not be the same - glob', done => {
      fcmp('./test/mock_files/*').areEqual()
      .should.eventually.equal(false).and.notify(done);
    });

    it('should not be the same - multi globs', done => {
      fcmp(
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('2').file,
        MOCK_FILES.get('5').file
      ).areEqual().should.eventually.equal(false).and.notify(done);
    });

    it('should not be the same - glob + stream', done => {
      fcmp(
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('6').file,
        createReadStream(MOCK_FILES.get('1').file),
        createReadStream(MOCK_FILES.get('3').file)
      ).areEqual().should.eventually.equal(false).and.notify(done);
    });
  });

  describe('#getChecksums', () => {
    before(() => {
      fcmp.options.algorithm = 'sha1';
    });

    it('shoud return correct sha1 hash', done => {
      fcmp(
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('2').file,
        MOCK_FILES.get('5').file,
        createReadStream(MOCK_FILES.get('2').file)
      ).getChecksum().should.be.fulfilled.then(chks => {
        let expectedResult = {
          [MOCK_FILES.get('1').file]: MOCK_FILES.get('1').sha1,
          [MOCK_FILES.get('2').file]: MOCK_FILES.get('2').sha1,
          [MOCK_FILES.get('5').file]: MOCK_FILES.get('5').sha1
        };

        chks.should.eql(expectedResult);
      }).should.notify(done);
    });
  });

  describe('#getDuplicate', () => {
    before(() => {
      fcmp.options.algorithm = 'sha1';
    });

    it('shoud return empty object', done => {
      fcmp(
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('4').file,
        createReadStream(MOCK_FILES.get('5').file)
      ).getDuplicates().should.be.fulfilled.then(dup => {
        Object.keys(dup).length.should.be.empty;
      }).should.notify(done);
    });

    it('shoud got two duplicate sets', done => {
      fcmp(
        MOCK_FILES.get('1').file,
        MOCK_FILES.get('2').file,
        MOCK_FILES.get('5').file,
        createReadStream(MOCK_FILES.get('2').file),
        createReadStream(MOCK_FILES.get('6').file)
      ).getDuplicates().should.be.fulfilled.then(dup => {
        dup.length.should.equal(2);
      }).should.notify(done);
    });
  });
});
