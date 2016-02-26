'use strict';

import {createReadStream} from 'fs';
import chai from 'chai';
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
  it('should fail with wrong type arguments', done => {
    let wrontArg = 1234;

    fcmp(wrontArg).should.be.rejected.and.notify(done);
  });

  it('should fail with a non-existent file', done => {
    let nonExistentFile = '/A/NON/EXISTENT/FILE';

    fcmp(
      nonExistentFile,
      MOCK_FILES.get('1').file,
      MOCK_FILES.get('4').file
    ).should.be.rejected.and.notify(done);
  });

  it('should be the same - glob', done => {
    fcmp('./test/mock_files/1*').should.eventually.equal(true).and.notify(done);
  });

  it('should be the same - multi globs', done => {
    fcmp(
      MOCK_FILES.get('1').file,
      MOCK_FILES.get('2').file,
      MOCK_FILES.get('3').file
    ).should.eventually.equal(true).and.notify(done);
  });

  it('should be the same - glob + stream', done => {
    fcmp(
      MOCK_FILES.get('1').file,
      MOCK_FILES.get('3').file,
      createReadStream(MOCK_FILES.get('1').file),
      createReadStream(MOCK_FILES.get('2').file)
    ).should.eventually.equal(true).and.notify(done);
  });

  it('should not be the same - glob', done => {
    fcmp('./test/mock_files/*').should.eventually.equal(false).and.notify(done);
  });

  it('should not be the same - multi globs', done => {
    fcmp(
      MOCK_FILES.get('1').file,
      MOCK_FILES.get('2').file,
      MOCK_FILES.get('5').file
    ).should.eventually.equal(false).and.notify(done);
  });

  it('should not be the same - glob + stream', done => {
    fcmp(
      MOCK_FILES.get('1').file,
      MOCK_FILES.get('6').file,
      createReadStream(MOCK_FILES.get('1').file),
      createReadStream(MOCK_FILES.get('3').file)
    ).should.eventually.equal(false).and.notify(done);
  });
});
