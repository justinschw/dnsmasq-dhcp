# dnsmasq-dhcp
A library to start and stop a lightweight DHCP server based on dnsmasq.
This library does not use any config files, it only passes command line arguments. So you can start as many instances of dnsmasq as you have interfaces.

## Installation
```
npm i dnsmasq-dhcp
```

## Usage
```
const DHCP = require('dnsmasq-dhcp');

let dhcpServer = new DHCP(options);

dhcpServer.start(result => {
  console.log(`Server started successfully: ${result} pid: ${dhcpServer.pid}`);
}).catch(err => {
  console.error(`Server failed to start: "${err.result.stderr}", errorCode=${err.result.code}`);
});
```

## Options
|Option|Type|Description|default|required|
|------|----|-----------|-------|--------|
|interface|String|Network Interface DHCP listens on|N/A|yes|
|beginIP|String|First IP in DHCP block|N/A|yes|
|endIP|String|Last IP in DHCP block|N/A|yes|
|netmask|String|Network mask|255.255.255.0|default|
|leaseLength|String|Length that IPs are leased|24h|default|
|authoritative|Boolean|DHCP server is authoritative on this network|true|default|
|listenAddress|String|IP Address that DHCP server is listening on|127.0.0.1|default|
|domain|String|Domain for DHCP server|N/A|no|
|pidFile|String|Path to pid file output by dnsmasq|/tmp/{uuid}.pid|default|
|hostsSpec|Array|An array of host spec definitions for static assignments|[]|default|


### Host spec definition
|Field|Type|Description|required|
|-----|----|-----------|--------|
|macAddr|String|MAC address of client device for static assignment|yes|
|ip|String|IP address to be statically assigned to client device|yes|