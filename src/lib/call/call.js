import { Session } from './session';

export class Call {
  createSession (id) {
    let session = new Session({ id });
    this.sessions.push(session);

    return session;
  }

  getSession (id) {
    return this.sessions.find(session => session.id === id);
  }
}
