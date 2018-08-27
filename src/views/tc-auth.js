import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components/view';
import { Identity } from '@twlv/core';

import './tc-auth.scss';

class TcAuth extends View {
  get template () {
    return require('./tc-auth.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      identity: {
        type: Object,
        value: () => (null),
      },
      computeAuth: {
        type: String,
        value: true,
      },
    });
  }

  signIn (evt) {
    evt.preventDefault();

    if (!this.identity) {
      throw new Error('Identity key is required');
    }

    this.__app.signIn(this.identity);

    this.__app.navigate('/');
  }

  computeOnline () {
    if (this.identity.privKey) {
      this.set('computeAuth', false);
      return;
    }
    this.set('computeAuth', true);
  }

  generate (evt) {
    evt.preventDefault();

    this.set({
      identity: Identity.generate(),
      computeAuth: false,
    });
  }
}

define('tc-auth', TcAuth);
