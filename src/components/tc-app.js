import { define } from '@xinix/xin';
import { App } from '@xinix/xin/components';
import { Node, Identity } from '@twlv/core';
import { Chat } from '../lib/chat';

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

    this.use(async (ctx, next) => {
      if (ctx.uri !== '/auth' && !this.client) {
        return this.navigate('/auth');
      }
      await next();
    });

    if (this.storage.TC_KEY) {
      let identity = new Identity(this.storage.TC_KEY);
      this.signIn(identity);
    }
  }

  signIn (identity) {
    let { networkId } = this;
    let node = new Node({ networkId, identity });
    this.storage.TC_KEY = identity.privKey;
    this.client = new Chat({ node });
  }
}

define('tc-app', TcApp);
