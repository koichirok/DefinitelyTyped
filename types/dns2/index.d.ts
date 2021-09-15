// Type definitions for dns2 2.0.1
// Project: https://github.com/song940/node-dns#readme
// Definitions by: Tim Perry <https://github.com/pimterry>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />

import * as net from 'net';
import * as udp from 'dgram';
import {EventEmitter} from 'events';

declare module "dns2" {

    namespace Packet {
        enum TYPE {
            A = 0x01,
             NS = 0x02,
             MD = 0x03,
             MF = 0x04,
            CNAME = 0x05,
            SOA = 0x06,
            MB = 0x07,
            MG = 0x08,
            MR = 0x09,
            NULL = 0x0a,
            WKS = 0x0b,
            PTR = 0x0c,
            HINFO = 0x0d,
            MINFO = 0x0e,
            MX = 0x0f,
            TXT = 0x10,
            AAAA = 0x1c,
            SRV = 0x21,
            EDNS = 0x29,
            SPF = 0x63,
            AXFR = 0xfc,
            MAILB = 0xfd,
            MAILA = 0xfe,
            ANY = 0xff,
            CAA = 0x101,
        }

        enum CLASS {
            IN = 0x01,
            CS = 0x02,
            CH = 0x03,
            HS = 0x04,
            ANY = 0xff,
        }

        function createResponseFromRequest(request: DnsRequest): DnsResponse;
    }

    interface Packet {
        toBuffer(): Buffer;
    }

    interface DnsRequest {
        header: {id: string};
        questions: DnsQuestion[];
    }

    interface DnsQuestion {
        name: string;
        type: Packet.TYPE;
        class: Packet.CLASS;
    }

    interface DnsResponse {
        answers: Array<AOrAaaaRecord | CnameOrPtrRecord | MxRecord | NsRecord | SoaRecord | TxtRecord>;
        authorities: Array<MxRecord | NsRecord>;
        additionals: Array<SoaRecord | TxtRecord>;
    }

    /* @internal */ interface DnsRecord {
        name: string;
        type: number;
        class: Packet.CLASS.IN;
        ttl: number;
    }

    interface AOrAaaaRecord extends DnsRecord {
        type: Packet.TYPE.A | Packet.TYPE.AAAA;
        address: string;
    }

    interface CnameOrPtrRecord extends DnsRecord {
        type: Packet.TYPE.CNAME | Packet.TYPE.PTR;
        domain: string;
    }

    interface MxRecord extends DnsRecord {
        type: Packet.TYPE.MX;
        exchange: string;
        priority: number;
    }

    interface NsRecord extends DnsRecord {
        type: Packet.TYPE.NS;
        ns: string;
    }

    interface SoaRecord extends DnsRecord {
        type: Packet.TYPE.SOA;
        primary: string;
        admin: string;
        serial: string;
        refresh: number;
        retry: number;
        expiration: number;
        minimum: number
    }

    interface TxtRecord extends DnsRecord {
        type: Packet.TYPE.TXT;
        data: string;
    }

    type DnsHandler = (
        request: DnsRequest,
        sendResponse: (response: DnsResponse) => void,
        remoteInfo: udp.RemoteInfo,
    ) => void;

    interface AddressesInfo {
        udp?: net.AddressInfo;
        tcp?: net.AddressInfo;
        doh?: net.AddressInfo;
    }

    class DNSServer extends EventEmitter {
        addresses(): AddressesInfo;

        listen(ports?: {
            udp?: number,
            tcp?: number,
            doh?: number
        }): Promise<AddressesInfo>;

        close(): Promise<void>;
    }

    class UDPServer extends udp.Socket {
        constructor(callback?: DnsHandler);
        listen(port: number, address: string): Promise<void>;
    }

    class TCPServer extends net.Server {
        constructor(callback?: DnsHandler);
    }

    function createServer(options: {
        udp?: boolean,
        tcp?: boolean,
        doh?: boolean,
        handle: DnsHandler
    }): DNSServer;

    function createUDPServer(...options: ConstructorParameters<typeof UDPServer>): UDPServer;

    function createTCPServer(...options: ConstructorParameters<typeof TCPServer>): TCPServer;

    function resolveA(domain: string, clientIp?: string): Promise<DnsResponse>;
    function resolveAAAA(domain: string): Promise<DnsResponse>;
    function resolveMX(domain: string): Promise<DnsResponse>;
    function resolveCNAME(domain: string): Promise<DnsResponse>;
}
