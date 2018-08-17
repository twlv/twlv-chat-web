import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components/view';

import './tc-conversation.scss';

class TcConversation extends View {
  get template () {
    return require('./tc-conversation.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      name: {
        type: String,
        value: 'To ...',
      },

      form: {
        type: Object,
        value: () => ({}),
      },

      messages: {
        type: Array,
        value: () => ([]),
      },
      classLine: {
        type: String,
        value: 'line',
      },
    });
  }

  attached () {
    super.attached();

    this.__app.client.on('channel:update', channel => {
      if (channel.id !== this.parameters.id) {
        return;
      }

      this.render(channel);
    });
  }

  async focusing () {
    super.focusing();

    this.channelId = this.parameters.id;
    this.$.messageField.focus();

    this.set('name', await this.__app.getChannelName(this.channelId));
  }

  async sendMessage (evt) {
    evt.preventDefault();

    let message = this.form.message;

    await this.__app.sendText(this.channelId, message);

    this.set('form.message', '');
    // TODO: workaround xin bug, value text not updated
    this.$.messageField.value = '';
  }

  render (channel) {
    this.set('messages', []);
    this.set('messages', channel.entries);
    let messagePane = this.$.messagesPane;

    setTimeout(() => {
      messagePane.scrollTo(0, messagePane.scrollHeight);
    }, 500);
  }

  isMyChat (address) {
    if (address !== this.__app.client.node.identity.address) {
      return false;
    }
    return true;
  }
}

define('tc-conversation', TcConversation);
