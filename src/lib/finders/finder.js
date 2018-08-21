// const debug = require('debug')('twlv-chat-web:lib:api-finder');

export class WebRTCFinder {
  up (node) {
    this.node = node;
  }

  down () {
    // noop
  }

  async find (address) {
    let { peer } = await this.node.connect(`wrtc:${address}`);
    return peer;
  }
}
