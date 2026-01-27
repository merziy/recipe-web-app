import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserCollection } from './user.js';
dotenv.config();

export function setupGoogleAuth(app, db) {
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });
  passport.deserializeUser(async (id, done) => {
    try {
      if (!id) return done(null, null);
      const users = getUserCollection(db);
      if (!ObjectId.isValid(id)) return done(null, null);
      const user = await users.findOne({ _id: new ObjectId(id) });
      if (!user) return done(null, null);
      return done(null, user);
    } catch (err) {
      return done(null, null);
    }
  });
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const users = getUserCollection(db);
      let user = await users.findOne({ googleId: profile.id });
      if (!user) {
        const insertResult = await users.insertOne({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        });
        user = await users.findOne({ _id: insertResult.insertedId });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
    try {
      const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      res.redirect(`${frontendBase}/auth`);
    } catch (err) {
      res.redirect('/?error=oauth');
    }
  });
}
