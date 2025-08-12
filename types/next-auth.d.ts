import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            emailVerified?: Date | null
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        emailVerified?: Date | null
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        emailVerified?: Date | null
    }
}
