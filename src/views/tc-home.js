import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components/view';

class TcHome extends View {
  get template () {
    return require('./tc-home.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      form: {
        type: Object,
        value: () => ({}),
      },
    });
  }
}

define('tc-home', TcHome);
