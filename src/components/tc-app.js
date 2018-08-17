import { define } from '@xinix/xin';
import { App } from '@xinix/xin/components';
import { Node, Identity } from '@twlv/core';
import { ApiClient } from '../lib/api';

import { TcNotification } from '../components/tc-notification';
import '@xinix/xin/middlewares';
import './tc-app.scss';

class TcApp extends App {
  get template () {
    return require('./tc-app.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      client: {
        type: Object,
      },

      storage: {
        type: Object,
        value: window.localStorage,
      },
    });
  }

  ready () {
    super.ready();

    this.networkId = this.__repository.get('tc.networkId') || 'twlv-chat';

    this.use(this._middleware.bind(this));
  }

  async _middleware (ctx, next) {
    if (this.storage.TC_KEY) {
      let identity = new Identity(this.storage.TC_KEY);
      await this.signIn(identity);
    }

    if (ctx.uri !== '/auth' && !this.client) {
      return this.navigate('/auth');
    }

    await next();
  }

  async signIn (identity) {
    let { networkId } = this;

    let node = new Node({ networkId, identity });

    let profile = {
      name: this.storage.TC_NAME || identity.address,
    };

    let controlUrls = this.__repository.get('tc.apiUrls');

    this.client = new ApiClient({ node, controlUrls, profile });

    this.client.on('channel:update', channel => {
      let currentId = this.getFragment().split('/').pop();
      if (channel.id !== currentId) {
        let { content: message, address } = channel.entries.pop();
        TcNotification.create({ message, address, channelId: channel.id });
      }
    });
    // prepare chat client
    await this.client.start();

    this.storage.TC_KEY = identity.privKey;
  }

  sendText (channelId, message) {
    this.client.send({ channelId, content: message });
  }

  async getChannelName (id) {
    let channel = await this.client.prepareChannel(id);
    return channel.members[0] === this.client.identity.address
      ? channel.members[1]
      : channel.members[0];
  }

}

define('tc-app', TcApp);
