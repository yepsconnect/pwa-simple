function showNotification(title, body) {
  return self.registration.showNotification(title, {
    body: body,
    icon: "icon.png",
    vibrate: [200, 100, 200],
  });
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "Новое уведомление", body: event.data.text() };
  }

  event.waitUntil(
    showNotification(
      data.title || "Уведомление",
      data.body || "Новое сообщение"
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("https://yepsconnect.github.io/pwa-simple/")
  );
});
