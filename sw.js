// Функция для показа уведомления
function showNotification(title, body) {
  console.log("[Service Worker] Показываем уведомление:", title, body);
  return self.registration.showNotification(title, {
    body: body,
    icon: "icon.png", // путь к иконке
    vibrate: [200, 100, 200], // вибрация (на поддерживаемых устройствах)
  });
}

// Обработка входящего push-сообщения
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Получено push-уведомление", event);

  // Данные могут приходить в разных форматах (текст или JSON)
  let data = {};
  try {
    data = event.data.json();
    console.log("Push-данные (JSON):", data);
  } catch (e) {
    data = { title: "Новое уведомление", body: event.data.text() };
    console.log("Push-данные (текст):", data);
  }

  // Ждем, пока уведомление будет показано
  event.waitUntil(
    showNotification(
      data.title || "Уведомление",
      data.body || "Новое сообщение"
    )
  );
});

// Обработка клика по уведомлению
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Клик по уведомлению", event.notification);
  event.notification.close(); // закрываем уведомление

  // Открываем страницу при клике
  event.waitUntil(
    clients.openWindow("https://yepsconnect.github.io/pwa-simple/") // замените на ваш URL
  );
});
