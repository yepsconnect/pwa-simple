function showNotification(title, body) {
  console.log("[Service Worker] Показываем уведомление:", title, body);
  return self.registration.showNotification(title, {
    body: body,
    icon: "icon.png",
    vibrate: [200, 100, 200],
  });
}

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Получено push-уведомление", event);

  let data = {};
  try {
    data = event.data.json();
    console.log("Push-данные (JSON):", data);
  } catch (e) {
    data = { title: "Новое уведомление", body: event.data.text() };
    console.log("Push-данные (текст):", data);
  }

  event.waitUntil(
    showNotification(
      data.title || "Уведомление",
      data.body || "Новое сообщение"
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Клик по уведомлению", event.notification);
  event.notification.close(); // закрываем уведомление

  event.waitUntil(
    clients.openWindow("https://yepsconnect.github.io/pwa-simple/")
  );
});
