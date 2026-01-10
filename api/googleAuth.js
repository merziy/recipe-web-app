import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserCollection } from './user.js';
dotenv.config();

export function setupGoogleAuth(app, db) {
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

  app.use(passport.initialize());

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), async (req, res) => {
    try {
      let user = req.user;
      if (user && user.insertedId) {
        user = await db.collection('users').findOne({ _id: user.insertedId });
      }
      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173/';
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (err) {
      res.redirect('/?error=oauth');
    }
  });
}
