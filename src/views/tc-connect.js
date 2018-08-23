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
        type: String,
        value: '',
      },
    });
  }

  get template () {
    return require('./tc-connect.html');
  }

  created () {
    super.created();

    this._onSessionStatus = this._onSessionStatus.bind(this);
  }

  async focused () {
    super.focused();

    this.set('initiator', Boolean(this.parameters.address));

    this.session = this.__app.call.getSession(this.parameters.id);

    if (!this.session) {
      this.session = this.__app.call.createSession(this.parameters.id);
    }

    this.set('status', this.session.status);
    this.session.on('status', this._onSessionStatus);

    if (this.initiator) {
      await this.session.invite(this.parameters.address);
    }
  }

  blurred () {
    super.blurred();
    this.session.removeListener('status', this._onSessionStatus);
    this.session = undefined;
  }

  async hangupClicked (evt) {
    evt.preventDefault();

    await this.session.hangup();

    this.__app.navigate('/');
  }

  async answerClicked (evt) {
    evt.preventDefault();

    await this.session.answer();
  }

  _onSessionStatus (status) {
    this.set('status', status);
  }
}

define('tc-connect', TcConnect);
