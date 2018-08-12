import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components/view';

class TcHome extends View {
  get template () {
    return require('./tc-home.html');
  }
}

define('tc-home', TcHome);
