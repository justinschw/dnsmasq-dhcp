'use strict';
const joi = require('joi');
const Netmask = require('new-netmask').Netmask;

function DnsMasqDhcp(options) {
    const schema = joi.object({
        interface: joi.string(1).required(),
        authoritative: true,
        listenAddress: joi.string().ip().default('127.0.0.1'),
        domain: joi.string().domain().optional(),
        network: joi.string().ip().optional(),
        netmask: joi.string().ip().optional(),
        leaseLength: joi.string().regex(/[0-9]+(m|h)/).default('24h'),
        hostsSpec: joi.array().items(joi.object({
            macAddr: joi.string().regex(/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/).required(),
            ip: joi.string().ip().required()
        })).default([])
    });
    const validated = joi.attempt(options, schema);
    // TODO: validate contents
    this.options = validated;
}

DnsMasqDhcp.prototype.start = function() {
    // TODO: start the server
    return null;
}

DnsMasqDhcp.prototype.stop = function() {
    // TODO: stop the server
    return null;
}
