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

    this.__app.chat.on('channel:update', channel => {
      if (channel.id !== this.parameters.id) {
        return;
      }

      this.render(channel);
    });
  }

  focusing () {
    super.focusing();

    this.async(async () => {
      this.channelId = this.parameters.id;

      this.$.messageField.focus();

      let channel = await this.__app.chat.prepareChannel(this.channelId);
      // this.set('name', await this.__app.getChannelName(this.channelId));
      this.render(channel);
    });
  }

  async sendMessage (evt) {
    evt.preventDefault();

    let message = this.form.message;
    await this.__app.chat.send({
      channelId: this.channelId,
      content: message,
    });

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
    if (address !== this.__app.node.identity.address) {
      return false;
    }
    return true;
  }
}

define('tc-conversation', TcConversation);
