import '@webcomponents/custom-elements';
import { bootstrap } from '@xinix/xin';
import './components/tc-app';

(async () => {
  await bootstrap({
    'view.loaders': [
      {
        test: /^tc-.*/,
        load (view) {
          return import(`./views/${view.name}`);
        },
      },
    ],
    // TODO: update for your app
  });
})();
