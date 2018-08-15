import '@webcomponents/custom-elements';
import { bootstrap } from '@xinix/xin';
import './components/tc-app';

import './fonts/lato/stylesheet.css';
import '@xinix/xin/scss/xin.scss';
import '@xinix/xin/scss/xin-components.scss';

const debug = require('debug')('twlv-chat-web:-');

// connect to local
// const SOCK_URL = `sockjs://${location.hostname}:3000/sock`;

// connect to heroku
const SOCK_URL = 'sockjs://twlv-chat-api.herokuapp.com/sock';

(async () => {
  debug(`Connecting to sock ${SOCK_URL}`);

  await bootstrap({
    'tc.networkId': 'twlv-chat',
    'tc.apiUrls': [
      SOCK_URL,
    ],
    'view.transition': 'fade',
    'view.loaders': [
      {
        test: /^tc-.*/,
        load (view) {
          return import(`./views/${view.name}`);
        },
      },
    ],
  });
})();
