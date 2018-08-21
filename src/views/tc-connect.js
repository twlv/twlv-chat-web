import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components';

class TcConnect extends View {
  get props () {
    return Object.assign({}, super.props, {
      initiator: {
        type: Boolean,
        value: false,
      },

      status: {
        type: Number,
        value: 0,
      },
    });
  }

  get template () {
    return require('./tc-connect.html');
  }

  focused () {
    super.focused();

    this.set('initiator', Boolean(this.parameters.address));

    let session = this.__app.call.getSession(this.parameters.id);

    if (!session) {
      session = this.__app.call.createSession(this.parameters.id);
    }

    this.async(async () => {
      session.on('status', status => {
        this.set('status', status);
      });
      await session.dial(this.parameters.address);
    });
  }
}

define('tc-connect', TcConnect);
