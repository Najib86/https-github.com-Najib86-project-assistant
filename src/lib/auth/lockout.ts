import prisma from "@/lib/prisma";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function isAccountLocked(user: { lockUntil: Date | null }): Promise<boolean> {
  if (!user.lockUntil) return false;
  return user.lockUntil > new Date();
}

export async function incrementFailedLogin(userId: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newAttempts = user.failedLoginAttempts + 1;
  const shouldLock = newAttempts >= LOCKOUT_THRESHOLD;

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: newAttempts,
      lockUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null
    }
  });
}

export async function resetFailedLogin(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null
    }
  });
}
