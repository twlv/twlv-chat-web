// const debug = require('debug')('twlv-chat-web:lib:api-finder');

export class ApiFinder {
  constructor (client) {
    this.client = client;
  }

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
