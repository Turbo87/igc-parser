import {Socket} from 'net';
import readline = require('readline');
import {ReadLine} from 'readline';

const aprs = require('aprs-parser');
const Emitter = require('tiny-emitter');

export default class OGNClient {
  readonly host = 'aprs.glidernet.org';
  readonly port = 10152;

  readonly user = 'test';
  readonly pass = '-1';
  readonly appName = 'test';
  readonly appVersion = '1.0';

  readonly senders: string[];

  private socket: Socket | undefined;
  private reader: ReadLine | undefined;
  private readonly _emitter = new Emitter();
  private readonly parser = new aprs.APRSParser();
  private _timer: any;

  constructor(senders: string[]) {
    this.senders = senders;
  }

  connect() {
    let socket = this.socket = new Socket();
    let reader = this.reader = readline.createInterface({ input: socket as NodeJS.ReadableStream });

    socket.connect(this.port, this.host, () => {
      socket.write(`user ${this.user} pass ${this.pass} vers ${this.appName} ${this.appVersion}\n`);
      this._emitter.emit('ready');
    });

    socket.on('close', () => {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = undefined;
      }
      this._emitter.emit('close');
    });

    reader.on('line', line => this.handleLine(line));

    this._timer = setTimeout(() => this.sendKeepAlive(), 30000);
  }

  handleLine(line: string) {
    this._emitter.emit('line', line);

    let knownSender = this.senders.some(sender => line.indexOf(sender) !== -1);
    if (knownSender) {
      let record = this.parser.parse(line);
      this._emitter.emit('record', record);
    }
  }

  scheduleKeepAlive() {
    this._timer = setTimeout(() => {
      this.sendKeepAlive();
      this.scheduleKeepAlive();
    }, 30000);
  }

  sendKeepAlive() {
    if (this.socket)
      this.socket.write('# keep alive');
  }

  on(event: string, handler: Function) {
    this._emitter.on(event, handler);
  }
}
