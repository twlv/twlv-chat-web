export class TcNotification {
  static initialize () {
    if (!('Notification' in window)) {
      alert('This browser does not support system notifications');
    }

    return Notification.requestPermission();
  }

  static create ({ title = 'Notification', body, icon, url, onClick = () => ({}) }) {
    if (Notification.permission === 'denied') {
      return;
    }

    let notification = new Notification(title, { body, icon });
    if (url) {
      onClick = () => {
        location.hash = url;
        notification.close();
      };
    }

    notification.addEventListener('click', onClick);

    return notification;
  }
}
