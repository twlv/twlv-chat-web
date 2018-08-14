import '@webcomponents/custom-elements';
import { bootstrap } from '@xinix/xin';
import './components/tc-app';

import './fonts/lato/stylesheet.css';
import '@xinix/xin/scss/xin.scss';
import '@xinix/xin/scss/xin-components.scss';

(async () => {
  await bootstrap({
    'tc.networkId': 'twlv-chat',
    'tc.apiUrls': [
      `sockjs://${location.hostname}:3000/sock`,
      // `sockjs://192.168.1.103:3000/sock`,
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
