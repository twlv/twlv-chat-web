import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components/view';

class TcConversation extends View {
  get template () {
    return require('./tc-conversation.html');
  }
}

define('tc-conversation', TcConversation);
