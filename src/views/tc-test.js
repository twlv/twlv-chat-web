import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components/view';

class TcTest extends View {
  get template () {
    return require('./tc-test.html');
  }
}

define('tc-test', TcTest);
