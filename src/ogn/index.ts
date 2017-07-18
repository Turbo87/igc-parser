import {Socket} from "net";
import * as readline from "readline";

export default class OGNClient {
  readonly host = 'aprs.glidernet.org';
  readonly port = 10152;

  readonly user = 'test';
  readonly pass = '-1';
  readonly appName = 'test';
  readonly appVersion = '1.0';

  readonly senders: string[];

  private readonly socket = new Socket();
  private readonly reader = readline.createInterface({ input: this.socket as NodeJS.ReadableStream });

  constructor(senders: string[]) {
    this.senders = senders;
    this.reader.on('line', line => this.handleLine(line));
  }

  connect() {
    this.socket.connect(this.port, this.host, () => {
      this.socket.write(`user ${this.user} pass ${this.pass} vers ${this.appName} ${this.appVersion}\n`);
      this.socket.emit('ready');
    });
  }

  handleLine(line: string) {
    let knownSender = this.senders.some(sender => line.indexOf(sender) !== -1);
    if (knownSender) {
      this.socket.emit('record', line);
    }
  }

  on(event: string, handler: Function) {
    if (event === 'line') {
      this.reader.on.call(this.reader, event, handler);
    } else {
      this.socket.on.call(this.socket, event, handler);
    }
  }
}
