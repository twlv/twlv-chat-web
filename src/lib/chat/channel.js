const { State } = require('./state');

class Channel {
  constructor ({ id, members }) {
    this.id = id;
    this.members = members;
    this.states = [];
    this.entries = [];
  }

  getState (address) {
    let state = this.states.find(state => state.address === address);
    if (!state) {
      state = new State({ address });
      let { states } = this;
      states.push(state);
      this.states = states.sort((s1, s2) => s1.address > s2.address);
    }

    return state;
  }

  reconcileStates (states) {
    let isAhead = Boolean(states.length === 0);
    let behindStates = [];

    let addresses = this.states.map(s => s.address);

    let peerStateMap = {};
    states.forEach(s => {
      peerStateMap[s.address] = s;
      if (addresses.indexOf(s.address) === -1) {
        addresses.push(s.address);
      }
    });

    addresses.forEach(address => {
      let state = this.getState(address);
      let peerState = peerStateMap[address] || new State({ address });

      let delta = state.compare(peerState);

      if (delta > 0) {
        isAhead = true;
      }

      if (peerState.address === this.address) {
        return;
      }

      if (delta < 0) {
        behindStates.push(state);
      }
    });

    return [ isAhead, behindStates ];
  }

  put (...putEntries) {
    if (putEntries.length === 0) {
      return;
    }

    let { entries } = this;
    putEntries.forEach(entry => {
      if (entries.find(e => e.address === entry.address && e.t === entry.t && e.c === entry.c)) {
        return;
      }

      entries.push(entry);
      this.getState(entry.address).update(entry);
    });

    this.entries = entries.sort((entry1, entry2) => State.compare(entry1, entry2));
  }

  async tail ({ limit = 100 } = {}) {
    let entries = await this.entries.slice(-limit);
    return entries;
  }

  tailUntil (states) {
    let stateMap = {};
    states.forEach(state => {
      stateMap[state.address] = state;
    });

    let entries = [];
    for (let i = this.entries.length - 1; i >= 0; i--) {
      let entry = this.entries[i];
      let state = stateMap[entry.address];
      if (state && State.compare(state, entry) < 0) {
        entries.unshift(entry);
      }
    }

    return entries;
  }
}

Channel.PRIVATE = 0;
Channel.GROUP = 1;

module.exports = { Channel };
