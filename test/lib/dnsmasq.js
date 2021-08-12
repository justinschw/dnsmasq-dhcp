'use strict';
const sandbox = require('sinon').createSandbox();
const mockSpawn = require('mock-spawn');
const mySpawn = mockSpawn();
require('child_process').spawn = mySpawn;
const expect = require('chai').expect;
const assert = require('chai').assert;
const DHCP = require('../../index');

async function expectError(fn) {
    let error = null;
    try {
        await fn();
    } catch (thrown) {
        error = thrown;
    }
    assert(error !== null);
}

describe('/lib/dnsmasq.js', function() {

    describe('constructor', function() {

        it('defaults', async function() {
            const dhcpServer = new DHCP({
                interface: 'eth0',
                beginIP: '192.168.1.2',
                endIP: '192.168.1.254'
            });
            expect(dhcpServer.binary).not.null;
        });

        it('incomplete', async function() {
            await expectError(async function() {
                new DHCP({});
            });
        });

    });

    describe('start', function() {

        it('success', function(done) {
            let code = 0;
            let stdout = 'dnsmasq started successfully';
            mySpawn.setDefault(mySpawn.simple(code, stdout));

            const dhcpServer = new DHCP({
                interface: 'eth0',
                beginIP: '192.168.1.2',
                endIP: '192.168.1.254'
            });

            dhcpServer.start().then(result => {
                expect(result.stdout).eql(stdout);
                expect(result.code).eql(code);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('failure', function(done) {
            let code = 3;
            let stderr = 'dnsmasq failed to start';
            mySpawn.setDefault(mySpawn.simple(code, null, stderr));

            const dhcpServer = new DHCP({
                interface: 'eth0',
                beginIP: '192.168.1.2',
                endIP: '192.168.1.254'
            });

            dhcpServer.start().then(result => {
                done(new Error('dnsmasq succeeded  but should have failed'));
            }).catch(err => {
                expect(err.result.stderr).eql(stderr);
                expect(err.result.code).eql(code)
                done();
            });
        });

    });

    describe('stop', function() {

        it('success - pid property', function(done) {
            let code = 0;
            mySpawn.setDefault(mySpawn.simple(code, null, null));

            const dhcpServer = new DHCP({
                interface: 'eth0',
                beginIP: '192.168.1.2',
                endIP: '192.168.1.254'
            });
            dhcpServer.pid = 1234;
            dhcpServer.stop().then(() => {
                done();
            });
        });

        it('success - pid property', function(done) {
            let code = 0;
            mySpawn.setDefault(mySpawn.simple(code, null, null));

            const dhcpServer = new DHCP({
                interface: 'eth0',
                beginIP: '192.168.1.2',
                endIP: '192.168.1.254'
            });
            dhcpServer.stop(1234).then(() => {
                done();
            });
        });

        it('noop - no pid', function(done) {
            let code = 0;
            mySpawn.setDefault(mySpawn.simple(code, null, null));

            const dhcpServer = new DHCP({
                interface: 'eth0',
                beginIP: '192.168.1.2',
                endIP: '192.168.1.254'
            });
            dhcpServer.stop().then(() => {
                done();
            });
        });

    });
});