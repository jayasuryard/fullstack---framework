import prisma from '../config/database.js';

export async function getPreferences(userId) {
  const prefs = await prisma.notificationPreference.findMany({ where: { userId } });
  return prefs.length
    ? prefs
    : [
        { type: 'general', email: true, inApp: true, push: true },
        { type: 'billing', email: true, inApp: true, push: false },
        { type: 'security', email: true, inApp: true, push: true },
        { type: 'updates', email: false, inApp: true, push: false },
      ].map((p) => ({ ...p, userId }));
}

export async function updatePreferences(userId, preferences) {
  const results = [];
  for (const pref of preferences) {
    const result = await prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type: pref.type } },
      update: { email: pref.email ?? true, inApp: pref.inApp ?? true, push: pref.push ?? true },
      create: { userId, type: pref.type, email: pref.email ?? true, inApp: pref.inApp ?? true, push: pref.push ?? true },
    });
    results.push(result);
  }
  return results;
}

export async function createAndNotify(userId, type, title, message, data = null, channels = ['in_app']) {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_type: { userId, type } },
  });

  const results = [];

  if (!pref || pref.inApp) {
    const notif = await prisma.notification.create({
      data: { userId, type, title, message, data, channel: 'in_app' },
    });
    results.push(notif);
  }

  if ((!pref || pref.email) && channels.includes('email')) {
    const { sendEmail } = await import('./emailService.js');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await sendEmail({ to: user.email, subject: title, html: `<p>${message}</p>` }).catch(() => {});
  }

  return results;
}
