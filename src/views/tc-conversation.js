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
      channelAddress: {
        type: String,
        value: '',
      },
    });
  }

  created () {
    super.created();

    this._onChannelUpdate = this._onChannelUpdate.bind(this);
  }

  focused () {
    super.focused();

    this.__app.chat.on('channel:update', this._onChannelUpdate);
  }

  blurred () {
    super.blurred();

    this.__app.chat.removeListener('channel:update', this._onChannelUpdate);
  }

  focusing () {
    super.focusing();

    this.async(async () => {
      this.channelId = this.parameters.id;

      this.$.messageField.focus();

      let channel = await this.__app.chat.prepareChannel(this.channelId);
      let channelAddress = channel.members.splice(channel.members.indexOf(channel.members[this.__app.node.identity.address]), 1);

      this.set('channelAddress', channelAddress.pop());
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

  _onChannelUpdate (channel) {
    if (channel.id !== this.parameters.id) {
      return;
    }

    this.render(channel);
  }

  startCall (evt) {
    evt.preventDefault();
    if (!this.channelAddress) {
      throw new Error('Address is required');
    }

    let session = this.__app.call.createSession();
    this.__app.navigate(`/connect/${session.id}/${this.channelAddress}`);
  }
}

define('tc-conversation', TcConversation);
