'use strict';
const joi = require('joi');
const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

function DnsMasqDhcp(options) {
    const schema = joi.object({
        interface: joi.string().min(1).required(),
        beginIP: joi.string().ip().required(),
        endIP: joi.string().ip().required(),
        netmask: joi.string().ip().default('255.255.255.0'),
        leaseLength: joi.string().regex(/[0-9]+(m|h)/).default('24h'),
        port: joi.number().port().default(5353),
        authoritative: joi.boolean().default(true),
        listenAddress: joi.string().ip().default('127.0.0.1'),
        domain: joi.string().domain().optional(),
        pidFile: joi.string().min(1).default(`/tmp/${uuid.v4()}.pid`),
        hostsSpec: joi.array().items(joi.object({
            macAddr: joi.string().regex(/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/).required(),
            ip: joi.string().ip().required()
        })).default([])
    });
    const validated = joi.attempt(options, schema);
    // TODO: validate contents
    this.options = validated;
    this.arguments = [
        '-i', this.options.interface,
        '--listen-address', this.options.listenAddress,
        '--dhcp-range',
        `${this.options.beginIP},${this.options.endIP},${this.options.netmask},${this.options.leaseLength}`,
        `--port=${this.options.port}`
    ];
    if (this.options.authoritative) {
        this.arguments.push('--dhcp-authoritative');
    }
    if (this.options.domain) {
        this.arguments.push('--domain');
        this.arguments.push(this.options.domain);
    }
    if (this.options.pidFile) {
        this.arguments.push(`--pid-file=${this.options.pidFile}`);
    }
    this.options.hostsSpec.forEach(spec => {
        this.arguments.push('--dhcp-host');
        this.arguments.push(`"${spec.macAddr},${spec.ip}"`);
    });

    // Accommodate /sbin in path
    this.path = process.env.PATH;
    if (this.path.indexOf('/sbin') < 0) {
        this.path = `${path}:/sbin`;
    }

    // Find dnsmasq binary
    this.binary = null;
    this.path.split(':').forEach(binPath => {
        if (fs.existsSync(path.join(binPath, 'dnsmasq'))) {
            this.binary = path.join(binPath, 'dnsmasq');
        }
    });
}

DnsMasqDhcp.prototype.start = function() {
    const dhcpServer = this;
    return new Promise(function(resolve, reject) {
        if (!dhcpServer.binary) {
            return reject(new Error(`dnsmasq binary not found in any of: ${dhcpServer.path}`))
        }
        const dnsmasq = spawn(dhcpServer.binary, dhcpServer.arguments);
        let result = {};

        dnsmasq.stdout.on('data', (data) => {
            result.stdout = data.toString('utf8').trim();
        });

        dnsmasq.stderr.on('data', (data) => {
            result.stderr = data.toString('utf8').trim();
        });

        dnsmasq.on('close', (code) => {
            result.code = code;
            if (fs.existsSync(dhcpServer.options.pidFile)) {
                dhcpServer.pid = fs.readFileSync(dhcpServer.options.pidFile, 'utf8').trim();
            }
            if (result.code !== 0) {
                let error = new Error(`dnsmasq failed to start`);
                error.result = result;
                return reject(error);
            } else {
                return resolve(result);
            }
        });
    });
}

DnsMasqDhcp.prototype.stop = function(pid) {
    const dhcpServer = this;
    return new Promise(function(resolve) {
        const dhcpPid = dhcpServer.pid || pid;
        if (fs.existsSync(dhcpServer.options.pidFile)) {
            fs.unlinkSync(dhcpServer.options.pidFile);
        }
        if (dhcpPid) {
            const kill = spawn('kill', [dhcpPid]);
            kill.on('close', () => {
                return resolve(dhcpPid);
            });
        } else {
            return resolve();
        }
    });
}

module.exports = DnsMasqDhcp;
