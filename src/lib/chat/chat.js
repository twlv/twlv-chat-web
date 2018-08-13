const { EventEmitter } = require('events');
const { Channel } = require('./channel');
const debug = require('debug')('twlv-chat:chat');
const assert = require('assert');

class Chat extends EventEmitter {
  constructor ({ node } = {}) {
    super();

    this.node = node;
    this.channels = [];

    this._onMessage = this._onMessage.bind(this);
  }

  get identity () {
    assert(this.node, 'Undefined node');
    return this.node.identity;
  }

  start () {
    assert(this.node, 'Undefined node');
    this.node.on('message', this._onMessage);
    return this.node.start();
  }

  stop () {
    assert(this.node, 'Undefined node');
    this.node.removeListener('message', this._onMessage);
    return this.node.stop();
  }

  async send ({ channelId, address, content, type = 'text/plain' }) {
    let channel;

    if (address) {
      channel = this.getPrivateChannel(address);
    } else if (channelId) {
      channel = this.prepareChannel(channelId);
    } else {
      throw new Error('Unknown send to, no channelId nor address specified');
    }

    let { t, c } = channel.getState(this.identity.address).next();
    await channel.put({ address: this.identity.address, content, type, t, c });
    this.emit('channel:update', channel);
    await this._syncStates(channel);
  }

  getPrivateChannel (address) {
    let members = this._sortAddresses(this.identity.address, address);
    let id = `${Channel.PRIVATE}${members.join('')}`;
    let channel = this.getChannel(id);
    if (!channel) {
      channel = new Channel({ id, members });
      this.channels.push(channel);
    }
    return channel;
  }

  getChannel (id) {
    return this.channels.find(channel => channel.id === id);
  }

  prepareChannel (id) {
    let channel = this.getChannel(id);
    if (!channel) {
      if (id[0] === '0') {
        let members = [ id.substr(1, 20), id.substr(21) ];
        let peer = members[0] === this.identity.address ? members[1] : members[0];
        channel = this.getPrivateChannel(peer);
      } else {
        throw new Error('Unimplemented');
      }
    }

    return channel;
  }

  _sortAddresses (addr1, addr2) {
    if (addr1 < addr2) {
      return [ addr1, addr2 ];
    }

    return [ addr2, addr1 ];
  }

  _generatePrivateChannelId (address) {
    return this.identity.address < address
      ? `${Channel.PRIVATE}${this.identity.address}${address}`
      : `${Channel.PRIVATE}${address}${this.identity.address}`;
  }

  async _syncStates (channel) {
    await Promise.all(channel.members.map(async address => {
      if (address === this.identity.address) {
        return;
      }

      try {
        await this._flightStates(address, channel);
      } catch (err) {
        console.error(err);
        // noop
      }
    }));
  }

  _flightStates (address, channel) {
    return this._deliver(address, {
      _: 'states',
      id: channel.id,
      states: channel.states,
    });
  }

  _flightGetEntries (address, channel) {
    return this._deliver(address, {
      _: 'getentries',
      id: channel.id,
      states: channel.states,
    });
  }

  _flightEntries (address, id, entries) {
    if (!entries.length) {
      return;
    }

    return this._deliver(address, {
      _: 'entries',
      id,
      entries,
    });
  }

  _deliver (to, payload) {
    return this.node.send({
      to,
      command: 'chat',
      payload,
    });
  }

  async _onMessage (message) {
    if (message.command !== 'chat') {
      return;
    }

    let payload = JSON.parse(message.payload);

    if (payload._ === 'states') {
      let { id, states } = payload;
      let channel = this.prepareChannel(id);

      let [ ahead, behindStates ] = channel.reconcileStates(states);

      if (behindStates.length) {
        await this._flightGetEntries(message.from, channel);
      }

      if (ahead) {
        await this._flightStates(message.from, channel);
      }
    } else if (payload._ === 'getentries') {
      let { id, states } = payload;
      let channel = this.getChannel(id);
      if (!channel) {
        debug('Channel not found');
        return;
      }

      let entries = await channel.tailUntil(states);
      await this._flightEntries(message.from, channel.id, entries);
    } else if (payload._ === 'entries') {
      let { id, entries } = payload;
      let channel = this.getChannel(id);
      if (!channel) {
        debug('Channel not found');
        return;
      }
      channel.put(...entries);
      this.emit('channel:update', channel);
    } else {
      throw new Error('Unimplemented');
    }
  }
}

module.exports = { Chat };
