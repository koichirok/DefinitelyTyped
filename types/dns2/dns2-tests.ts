// Based on examples taken from the package readme for 2.0.1:
// https://github.com/song940/node-dns/tree/fd953b3643c1423d7455ab352468549bab0638c1

import {RemoteInfo} from 'dgram';
import {DnsQuestion, DnsRequest, DnsResponse, DNSServer} from 'dns2';

// DNS Client (default UDP)
(() => {
    const dns2 = require('dns2');

    const options = {
        // available options
        // dns: dns server ip address or hostname (string),
        // port: dns server port (number),
        // recursive: Recursion Desired flag (boolean, default true, since > v1.4.2)
    };
    const dns = new dns2(options);

    (async () => {
        const result = await dns.resolveA('google.com');
        console.log(result.answers);
    })();
})();

/// Another way to instanciate dns2 UDP Client:
(() => {
    const {UDPClient} = require('dns2');

    const resolve = UDPClient();

    (async () => {
        const response = await resolve('google.com')
        console.log(response.answers);
    })();
})();

// DNS Client (TCP)
(() => {
    const {TCPClient} = require('dns2');

    const resolve = TCPClient();

    (async () => {
        try {
            const response = await resolve('lsong.org')
            console.log(response.answers);
        } catch (error) {
            // some DNS servers (i.e cloudflare 1.1.1.1, 1.0.0.1)
            // may send an empty response when using TCP
            console.log(error);
        }
    })();
})();

// Client Custom DNS Server
(() => {

    const {TCPClient} = require('dns2');

    const resolve = TCPClient({
        dns: '1.1.1.1'
    });

    (async () => {
        try {
            const result = await resolve('google.com');
            console.log(result.answers);
        } catch (error) {
            console.log(error);
        }
    })();
})();

// System DNS Server
(() => {

    const dns = require('dns');
    const {TCPClient} = require('dns2');

    const resolve = TCPClient({
        dns: dns.getServers()[0]
    });

    (async () => {
        try {
            const result = await resolve('google.com');
            console.log(result.answers);
        } catch (error) {
            console.log(error);
        }
    })();
})();

// Example Server
(() => {
    const dns2 = require('dns2');

    const {Packet} = dns2;

    const server: DNSServer = dns2.createServer({
        udp: true,
        handle: (
            request: DnsRequest,
            send: (response: DnsResponse) => void,
            rinfo: RemoteInfo
        ) => {
            const response: DnsResponse = Packet.createResponseFromRequest(request);
            const [question]: DnsQuestion[] = request.questions;
            const {name} = question;
            response.answers.push({
                name,
                type: Packet.TYPE.A,
                class: Packet.CLASS.IN,
                ttl: 300,
                address: '8.8.8.8'
            });
            send(response);
        }
    });

    server.on('request', (request, response, rinfo) => {
        console.log(request.header.id, request.questions[0]);
    });

    server.on('listening', () => {
        console.log(server.addresses());
    });

    server.on('close', () => {
        console.log('server closed');
    });

    server.listen({
        udp: 5333
    });

    // eventually
    server.close();
})();
