import { define } from '@xinix/xin';
import { App } from '@xinix/xin/components';
import { Node, Identity } from '@twlv/core';
import { SockJsDialer } from '@twlv/transport-sockjs/dialer';
import { WebRTCDialer, WebRTCListener } from '@twlv/transport-webrtc';
import { Chat } from '../lib/chat';
import { WebRTCFinder } from '../lib/finders';

import { TcNotification } from '../components/tc-notification';
import '@xinix/xin/middlewares';
import './tc-app.scss';

class TcApp extends App {
  get template () {
    return require('./tc-app.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      storage: {
        type: Object,
        value: window.localStorage,
      },
    });
  }

  ready () {
    super.ready();

    this._onChannelUpdate = this._onChannelUpdate.bind(this);

    this.networkId = this.__repository.get('tc.networkId') || 'twlv-chat';
    this.apiUrls = this.__repository.get('tc.apiUrls');

    this.use(this._middleware.bind(this));
  }

  async _middleware (ctx, next) {
    if (!this.node && this.storage.TC_KEY) {
      let identity = new Identity(this.storage.TC_KEY);
      await this.signIn(identity);
    }

    if (ctx.uri !== '/auth' && !this.node) {
      return this.navigate('/auth');
    }

    await next();
  }

  async signIn (identity) {
    let { networkId } = this;

    this.node = new Node({ networkId, identity });

    this.node.addDialer(new SockJsDialer());
    this.node.addFinder(new WebRTCFinder());

    let listener = new WebRTCListener();
    let dialer = new WebRTCDialer();
    this.node.addListener(listener);
    this.node.addDialer(dialer);

    await this.node.start();

    this.apiAddresses = [];
    await Promise.all(this.apiUrls.map(async url => {
      let con = await this.node.connect(url);
      this.apiAddresses.push(con.peer.address);
    }));

    listener.signalers = dialer.signalers = this.apiAddresses;

    this.profile = {
      name: this.storage.TC_NAME || identity.address,
    };

    this.chat = new Chat({ node: this.node });

    this.chat.on('channel:update', this._onChannelUpdate);

    // prepare chat client
    await this.chat.start();

    this.storage.TC_KEY = identity.privKey;
  }

  _onChannelUpdate (channel) {
    let inConversation = this.getFragment().match(/^\/conversation\/([a-zA-Z0-9]+)/);

    if (inConversation && channel.id === inConversation[1]) {
      return;
    }

    TcNotification.create({
      title: 'You got message',
      body: 'You got message',
      url: `#!/conversation/${channel.id}`,
    });
  }
}

define('tc-app', TcApp);
