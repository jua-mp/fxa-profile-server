/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');

const Server = require('./lib/server');

/*global describe,it*/

describe('server', function() {
  function checkVersionAndHeaders(path) {
    return function(done) {
      return Server.get('/').then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.version, require('../package.json').version);
        assert(res.result.commit);

        // must return HPKP header
        var hpkpHeader = 'max-age=0; includeSubDomains; pin-sha256="5kJvNEMw0KjrCAu7eXY5HZdvyCS13BbA0VJG1RSP91w="; ' +
          'pin-sha256="PZXN3lRAy+8tBKk2Ox6F7jIlnzr2Yzmwqc3JnyfXoCw="; pin-sha256="r/mIkG3eEpVdm+u/ko/cwxzOMo1bk4TyHIlByibiA5E=";';
        assert.equal(res.headers['public-key-pins'], hpkpHeader, 'HPKP header was set correctly');

        // and must return an STS header
        var stsHeader = res.headers['strict-transport-security'];
        assert.equal(stsHeader, 'max-age=15552000; includeSubdomains');

        // but the other security builtin headers from hapi are not set
        var other = {
          'x-content-type-options': 1,
          'x-download-options': 1,
          'x-frame-options': 1,
          'x-xss-protection': 1
        };

        Object.keys(res.headers).forEach(function(header) {
          assert.ok(!other[header.toLowerCase()]);
        });
      }).done(done, done);
    };
  }

  describe('/', function() {
    it('should return the version', checkVersionAndHeaders('/'));
  });

  describe('/__version__', function() {
    it('should return the version', checkVersionAndHeaders('/__version__'));
  });

  describe('/__heartbeat__', function() {
    it('should succeed', function() {
      return Server.get('/__heartbeat__').then(function(res) {
        assert.equal(res.statusCode, 200);
      });
    });
  });

  describe('/__lbheartbeat__', function() {
    it('should succeed', function() {
      return Server.get('/__lbheartbeat__').then(function(res) {
        assert.equal(res.statusCode, 200);
      });
    });
  });
});

