import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleUser = {
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            avatarUrl: profile.photos?.[0]?.value || null,
          }
          done(null, googleUser)
        } catch (err) {
          done(err, null)
        }
      }
    )
  )
} else {
  console.warn('Google OAuth credentials not set — Google login disabled until configured.')
}

export default passport