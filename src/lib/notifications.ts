// ── VuraPet Push Notifications ──

export function getNotificationMessage(petName: string, species: string, hoursSinceLastMeal: number): {
  title: string;
  body: string;
} {
  const isCat = species?.toLowerCase().includes('cat');

  if (hoursSinceLastMeal >= 12) {
    return {
      title: `😭 ${petName} is STARVING!`,
      body: isCat
        ? `${petName} has initiated a formal complaint. The bowl has been empty for far too long.`
        : `${petName} is doing their saddest puppy eyes. They need you right now!`,
    };
  }

  if (hoursSinceLastMeal >= 8) {
    return {
      title: `🥺 ${petName} is really hungry`,
      body: isCat
        ? `${petName} is staring at their bowl. You know what that means.`
        : `${petName} keeps checking the kitchen. Time to save the day!`,
    };
  }

  if (hoursSinceLastMeal >= 4) {
    return {
      title: `😐 ${petName} is getting peckish`,
      body: isCat
        ? `${petName} has noticed the bowl situation. They are not impressed.`
        : `${petName}'s tail speed is dropping. A meal would fix that immediately.`,
    };
  }

  return {
    title: `🔥 Keep ${petName}'s streak alive!`,
    body: `Don't forget to log ${petName}'s meal today and keep that streak going!`,
  };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'chow-streak',
  });
}

export function scheduleHungerCheck(
  petName: string,
  species: string,
  lastMealAt: Date | null,
  onNotify: (title: string, body: string) => void
) {
  if (!lastMealAt) {
    const msg = getNotificationMessage(petName, species, 99);
    onNotify(msg.title, msg.body);
    return;
  }

  const hoursSince = (Date.now() - lastMealAt.getTime()) / 3_600_000;
  const thresholds = [4, 8, 12];

  for (const threshold of thresholds) {
    if (hoursSince < threshold) {
      const msUntilThreshold = (threshold - hoursSince) * 3_600_000;
      setTimeout(() => {
        const msg = getNotificationMessage(petName, species, threshold);
        onNotify(msg.title, msg.body);
        sendNotification(msg.title, msg.body);
      }, msUntilThreshold);
      break;
    }
  }
}