import { define } from '@xinix/xin';
import { App } from '@xinix/xin/components';

import '@xinix/xin/middlewares/lazy-view';

class TcApp extends App {
  get template () {
    return require('./tc-app.html');
  }
}

define('tc-app', TcApp);
