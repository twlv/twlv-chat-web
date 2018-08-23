import uuidv4 from 'uuid/v4';
import { EventEmitter } from 'events';

export class Session extends EventEmitter {
  constructor ({ manager, id = uuidv4() }) {
    super();

    this.manager = manager;
    this.id = id;
    this.status = 'idle';

    this._onSocketStream = this._onSocketStream.bind(this);
  }

  _invite (address) {
    this.setStatus('ringing');
    this.peerAddress = address;
  }

  async invite (address) {
    this.setStatus('connecting');

    try {
      await this.manager.connect(address);

      this._invite(address);

      await this.manager.send(address, 'invite', { id: this.id });
    } catch (err) {
      this.setStatus('not-found');
      throw new Error('Peer not found');
    }
  }

  async hangup () {
    if (!this.peerAddress) {
      return;
    }

    await this.manager.send(this.peerAddress, 'hangup', { id: this.id });

    this._hangup();
  }

  _hangup () {
    this.setStatus('idle');
    this.emit('hangup');

    if (this.peerSocket) {
      this.peerSocket.removeListener('stream', this._onSocketStream);
      this.peerSocket.destroy();
      this.peerSocket = undefined;
    }
  }

  async answer () {
    await this.manager.send(this.peerAddress, 'answer', { id: this.id });

    await this._answer();
  }

  async _onPeerMessage ({ command, payload }) {
    switch (command) {
      case 'hangup':
        await this._hangup();
        break;
      case 'answer':
        await this._answer();
        break;
      case 'notify-stream':
        this.remoteStreamVersion = payload.version;
        await this.requestStream();
        break;
      case 'stream':
        this.peerSocket.addStream(this.stream);
        break;
      default:
        throw new Error('Unimplemented yet');
    }
  }

  async _answer () {
    let connection = await this.manager.connect(this.peerAddress);

    this.peerSocket = connection.socket;
    this.peerSocket.on('stream', this._onSocketStream);

    this.setStatus('establish');
    this.emit('establish');
  }

  setStatus (status) {
    this.status = status;
    this.emit('status', status);
  }

  setStream (stream) {
    this.stream = stream;
    this.manager.send(this.peerAddress, 'notify-stream', { id: this.id, version: new Date().toJSON() });
  }

  requestStream (version) {
    this.manager.send(this.peerAddress, 'stream', { id: this.id, version });
  }

  _onSocketStream (stream) {
    this.emit('stream', stream);
  }
}
