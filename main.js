const vapidPublicKey =
  "BPil4UBbvS9ajjCsth2NGAbmX-Sd1ZffenpPJ7U4bxmkG0auFNd-Vz_NAKDhRd7Rt7hLggWlHmXAfdM7_ZiIKDE";
let serviceWorkerRegistration;
let pushSubscription;

document.addEventListener("DOMContentLoaded", async () => {
  if ("serviceWorker" in navigator) {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register(
        "sw.js"
      );

      pushSubscription =
        await serviceWorkerRegistration.pushManager.getSubscription();
      if (pushSubscription) {
        updateUI(true, true);
        showStatus("У вас уже есть активная подписка", "success");
      }
    } catch (error) {
      console.error("Ошибка регистрации Service Worker:", error);
      showStatus("Ошибка регистрации Service Worker", "error");
    }
  } else {
    showStatus("Ваш браузер не поддерживает Service Worker", "error");
  }
});

async function enableNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      showStatus("Разрешение на уведомления получено", "success");
      document.getElementById("registerBtn").disabled = false;
      document.getElementById("enableBtn").disabled = true;
    } else {
      showStatus("Разрешение не получено", "error");
    }
  } catch (error) {
    console.error("Ошибка запроса разрешения:", error);
    showStatus("Ошибка запроса разрешения", "error");
  }
}

async function registerDevice() {
  try {
    if (!serviceWorkerRegistration) {
      throw new Error("Service Worker не зарегистрирован");
    }

    pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const response = await sendSubscriptionToServer(pushSubscription);

    showStatus("Устройство успешно зарегистрировано!", "success");
    updateUI(true, true);
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    showStatus("Ошибка регистрации: " + error.message, "error");
  }
}

async function sendSubscriptionToServer(subscription) {
  const p256dh = btoa(
    String.fromCharCode.apply(
      null,
      new Uint8Array(subscription.getKey("p256dh"))
    )
  );

  const auth = btoa(
    String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth")))
  );

  const response = await fetch("https://dkpush.boxt.one/api/pwa/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: p256dh,
        auth: auth,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка сервера: ${error}`);
  }
  return response.json();
}

function updateUI(notificationsEnabled, deviceRegistered) {
  document.getElementById("enableBtn").disabled = notificationsEnabled;
  document.getElementById("registerBtn").disabled = deviceRegistered;
}

function showStatus(message, type) {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.className = "status " + type;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
