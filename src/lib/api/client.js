import { Chat } from '../chat';
import { ApiFinder } from './finder';
import { SockJsDialer } from '@twlv/transport-sockjs/dialer';
import { WebRTCDialer, WebRTCListener } from '@twlv/transport-webrtc';

const debug = require('debug')('twlv-chat-web:lib:api:client');

export class ApiClient extends Chat {
  constructor ({ node, profile, controlUrls = [] } = {}) {
    super({ node });

    this.profile = profile;
    this.controlUrls = controlUrls;

    this._findings = {};
    this._onControlMessage = this._onControlMessage.bind(this);
  }

  setProfile (profile) {
    this.profile = profile;
  }

  async sendControl (command, data) {
    // TODO: implement multiple control addresses
    await this.node.send({
      to: this.controlAddresses[0],
      command: `twlv-chat-api:${command}`,
      payload: JSON.stringify(data),
    });
  }

  async start () {
    this.node.on('message', this._onControlMessage);

    this.node.addDialer(new SockJsDialer());
    this.node.addFinder(new ApiFinder(this));

    let listener = new WebRTCListener();
    let dialer = new WebRTCDialer();
    this.node.addListener(listener);
    this.node.addDialer(dialer);

    await super.start();

    // setup control api connections
    this.controlAddresses = [];
    await Promise.all(this.controlUrls.map(async url => {
      let con = await this.node.connect(url);
      this.controlAddresses.push(con.peer.address);
    }));
    listener.signalers = dialer.signalers = this.controlAddresses;

    // send first introduction to control api
    this.sendControl('introduce', this.profile);
  }

  async stop () {
    this.node.removeListener('message', this._onControlMessage);
    await super.stop();
  }

  find (address) {
    return new Promise(async (resolve, reject) => {
      let finding = this._findings[address];
      if (finding) {
        finding.push({ resolve, reject });
        return;
      }

      await this.sendControl('find', address);
      this._findings[address] = [ { resolve, reject } ];
    });
  }

  _onControlMessage (message) {
    if (!message.command.startsWith('twlv-chat-api:')) {
      return;
    }

    let from = message.from;
    let command = message.command.split('twlv-chat-api:').pop();
    let data = JSON.parse(message.payload);

    debug('got control message', from, command, data);
  }
}
