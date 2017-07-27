import {BBox} from 'cheap-ruler';

const WebSocket = require('ws');
const aprs = require('aprs-parser');

export default class GliderTrackerClient {
  onClose: () => void;
  onTrack: (id: string, fixes: any[]) => void;
  onRecord: (record: any) => void;

  private ws: any;
  private readonly parser = new aprs.APRSParser();

  connect() {
    this.ws = new WebSocket('ws://glidertracker.de:3389/');

    this.ws.onclose = () => {
      this.ws = null;
      if (this.onClose)
        this.onClose();
    };

    this.ws.onmessage = (event: any) => {
      this.handleMessage(event.data);
    };

    return new Promise(resolve => {
      this.ws.onopen = resolve;
    });
  }

  send(message: string) {
    if (this.ws) {
      this.ws.send(message);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  setView(bbox: BBox) {
    let [minX, minY, maxX, maxY] = bbox;
    this.send(`VIEW:${minX}|${minY}|${maxX}|${maxY}`);
  }

  requestTrack(id: string, from: number, to: number) {
    this.send(`TRACK?${id}|${from}|${to}`);
  }

  private handleMessage(message: string) {
    if (message.startsWith('TRACK:')) {
      let parts = message.split('|');
      let id = parts.shift()!.slice(6);
      let fixes = parts.filter(Boolean).map(str => {
        let parts = str.split('/');
        let lat = parseFloat(parts[0]);
        let lon = parseFloat(parts[1]);
        let alt = parseFloat(parts[2]);
        let time = Date.parse(parts[3]);
        return {lat, lon, alt, time};
      });

      if (this.onTrack)
        this.onTrack(id, fixes);

    } else if (message.includes('>APRS')) {
      let record = this.parser.parse(message);
      if (this.onRecord)
        this.onRecord(record);

    } else if (message === 'PING?!?') {
      this.send('PONG!?!');
    }
  }
}
