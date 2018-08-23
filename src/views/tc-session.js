import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components';

import './tc-session.scss';

class TcSession extends View {
  get props () {
    return Object.assign({}, super.props, {
      status: {
        type: String,
        value: '',
      },
    });
  }

  get template () {
    return require('./tc-session.html');
  }

  created () {
    super.created();

    this._onSessionStatus = this._onSessionStatus.bind(this);
    this._onSessionStream = this._onSessionStream.bind(this);
  }

  async focused () {
    super.focused();

    try {
      this.session = this.__app.call.getSession(this.parameters.id);

      if (!this.session) {
        // DEBUG: for debug purpose only
        // this.session = this.__app.call.createSession(this.parameters.id);
        // try {
        //   await this.__app.call.connect(localStorage.debugPeer);
        // } catch (err) {
        //   await this.__app.call.connect(localStorage.debugPeer);
        // }
        // await this.session._invite(localStorage.debugPeer);
        // await this.session._answer();
        // DEBUG: for debug purpose only

        console.error('Invalid session fallback to home');
        this.__app.navigate('/');
        return;
      }

      this.set('status', this.session.status);
      this.session.on('status', this._onSessionStatus);
      this.session.on('stream', this._onSessionStream);

      let stream;
      if (localStorage.debugVideo) {
        this.$.localVideo.src = localStorage.debugVideo;
        stream = this.$.localVideo.captureStream();
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        this.$.localVideo.srcObject = stream;
      }

      await this.async(async () => {
        await this.session.setStream(stream);
      }, 1000);

      // if (this.session.remoteStreamVersion) {
      //   await this.session.requestStream();
      // }
    } catch (err) {
      console.error('got err', err.stack);
    }
  }

  blurred () {
    super.blurred();

    this.$.localVideo.src = '';
    this.$.localVideo.srcObject = null;
    this.$.remoteVideo.src = '';
    this.$.remoteVideo.srcObject = null;

    this.session.removeListener('status', this._onSessionStatus);
    this.session = undefined;
  }

  _onSessionStatus (status) {
    this.set('status', status);
  }

  _onSessionStream (stream) {
    this.$.remoteVideo.srcObject = stream;
  }

  async hangupClicked (evt) {
    evt.preventDefault();

    await this.session.hangup();

    this.__app.navigate('/');
  }
}

define('tc-session', TcSession);
