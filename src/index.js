import '@webcomponents/custom-elements';
import { bootstrap } from '@xinix/xin';
import './components/tc-app';

import '@xinix/xin/scss/xin.scss';
import '@xinix/xin/scss/xin-components.scss';

(async () => {
  await bootstrap({
    // 'tc.networkId': 'twlv-chat',
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
