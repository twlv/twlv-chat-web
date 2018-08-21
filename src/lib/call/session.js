import uuidv4 from 'uuid/v4';
import { EventEmitter } from 'events';

export class Session extends EventEmitter {
  constructor ({ node, id = uuidv4() }) {
    super();

    this.id = id;
    this.members = [];
  }

  dial (address) {
    return new Promise((resolve, reject) => {
      this.emit('status', 0);

      // TODO: implement dialing
    });
  }
}
