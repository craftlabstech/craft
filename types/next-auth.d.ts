import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            onboardingCompleted?: boolean
            emailVerified?: Date | null
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        onboardingCompleted?: boolean
        emailVerified?: Date | null
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        onboardingCompleted?: boolean
        emailVerified?: Date | null
    }
}
