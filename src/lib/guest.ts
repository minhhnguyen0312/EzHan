import "server-only"
import { db } from "@/lib/db"

const GUEST_EMAIL = "guest@ezhan.local"

export async function getGuestUser() {
  return db.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: {
      email: GUEST_EMAIL,
      name: "Guest Learner",
      onboardingComplete: false,
    },
  })
}

