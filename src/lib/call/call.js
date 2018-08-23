import { Session } from './session';
import { EventEmitter } from 'events';

export class Call extends EventEmitter {
  constructor ({ node, command = 'call', sessions = [] }) {
    super();

    this.node = node;
    this.command = command;
    this.sessions = sessions;

    this._onMessage = this._onMessage.bind(this);
  }

  start () {
    this.node.on('message', this._onMessage);
  }

  stop () {
    this.node.removeListener(this.command, this._onMessage);
  }

  createSession (id) {
    let session = new Session({ manager: this, id });
    this.sessions.push(session);
    session.on('hangup', () => {
      let index = this.sessions.indexOf(session);
      if (index !== -1) {
        this.sessions.splice(index, 1);
      }

      this.emit('session:hangup', session);
    });
    session.on('establish', () => {
      this.emit('session:establish', session);
    });

    return session;
  }

  getSession (id) {
    return this.sessions.find(session => session.id === id);
  }

  getOrCreateSession (id) {
    let session = this.getSession(id);
    if (!session) {
      session = this.createSession(id);
    }
    return session;
  }

  connect (address) {
    return this.node.connect(address);
  }

  async send (addresses, command, payload) {
    if (typeof addresses === 'string') {
      addresses = [ addresses ];
    }
    await Promise.all(addresses.map(address => {
      return this.node.send({
        to: address,
        command: this.command,
        payload: { command, payload },
      });
    }));
  }

  async _onMessage (message) {
    if (message.command !== this.command) {
      return;
    }

    let { command, payload } = JSON.parse(message.payload);
    let session = this.getSession(payload.id);

    if (command === 'invite') {
      if (!session) {
        session = this.createSession(payload.id);
      }
      session._invite(message.from);
      this.emit('session:invite', session);
      return;
    }

    if (!session) {
      return;
    }

    await session._onPeerMessage({ command, payload });
  }
}
