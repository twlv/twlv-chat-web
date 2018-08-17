export class TcNotification {
  static create ({ message, address, channelId = '' }) {
    let notification = new Notification(`From: ${address}`, { body: message });
    notification.onclick = () => {
      location.hash = '#!/conversation/' + channelId;
    };
  }
}
