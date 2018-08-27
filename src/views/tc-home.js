import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components/view';

class TcHome extends View {
  get template () {
    return require('./tc-home.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      address: {
        type: String,
        value: '',
      },

      form: {
        type: Object,
        value: () => ({}),
      },

      callForm: {
        type: Object,
        value: () => ({}),
      },
    });
  }

  focusing () {
    super.focusing();

    this.set('address', this.__app.node.identity.address);
  }

  startConversation (evt) {
    evt.preventDefault();

    if (!this.form || !this.form.address) {
      throw new Error('Address is required');
    }

    let channel = this.__app.chat.getPrivateChannel(this.form.address);
    this.__app.navigate(`/conversation/${channel.id}`);
  }
}

define('tc-home', TcHome);
