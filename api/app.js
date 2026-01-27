import { v2 as cloudinary } from 'cloudinary';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { MongoClient } from 'mongodb';
import passport from 'passport';

import { loginUser, signupUser } from './auth.js';

import { setupGoogleAuth } from './googleAuth.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

function checkDatabase(res) {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected. Please check if MongoDB is running.' });
  }
  return null;
}

const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'recipeApp';
let db;
let mongoClient;

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  store: MongoStore.create({ mongoUrl, dbName })
}));

app.use(passport.initialize());
app.use(passport.session());

app.post('/api/signup', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const userId = await signupUser(db, email, password);
    res.json({ success: true, userId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await loginUser(db, email, password);
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to create session' });
      res.json({ success: true });
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
app.post('/api/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

app.get('/api/me', (req, res) => {
  if (!req.user) return res.json({ signedIn: false });
  res.json({ signedIn: true, email: req.user.email });
});
async function connectToMongoDB() {
  try {
    if (!mongoClient) {
      console.log('Connecting to MongoDB:', mongoUrl);
      mongoClient = await MongoClient.connect(mongoUrl, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        maxPoolSize: 1
      });
      db = mongoClient.db(dbName);
      console.log('Connected to MongoDB');
      setupGoogleAuth(app, db);
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    mongoClient = null;
    db = null;
  }
}

function ensureAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/recipes', ensureAuth, async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const recipe = { ...req.body, userId: req.user._id, userEmail: req.user.email };
    const result = await db.collection('recipes').insertOne(recipe);
    res.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Recipe added successfully!'
    });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

app.get('/api/cloudinary-signature', async (req, res) => {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const params_to_sign = {
      timestamp,
      folder: 'recipes'
    };
    
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign, 
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'recipes'
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
});

app.get('/api/recipes', ensureAuth, async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const recipes = await db.collection('recipes').find({ userId: req.user._id }).toArray();
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.put('/api/recipes/:handle', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const { handle } = req.params;
    const updatedRecipe = req.body;
    
    const result = await db.collection('recipes').updateOne(
      { handle },
      { $set: updatedRecipe }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ 
      success: true,
      message: 'Recipe updated successfully!' 
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.post('/api/recipes/:handle/date', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const { handle } = req.params;
    const { date } = req.body;
    
    await db.collection('scheduledRecipes').updateOne(
      { handle, date },
      { $set: { handle, date, scheduledAt: new Date() } },
      { upsert: true }
    );
    
    res.json({ 
      success: true,
      message: 'Recipe scheduled successfully!' 
    });
  } catch (error) {
    console.error('Error scheduling recipe:', error);
    res.status(500).json({ error: 'Failed to schedule recipe' });
  }
});

app.get('/api/recipes/date/:date', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const { date } = req.params;
    
    const scheduledRecipes = await db.collection('scheduledRecipes')
      .find({ date })
      .toArray();
    
    const recipeHandles = scheduledRecipes.map(sr => sr.handle);
    const recipes = await db.collection('recipes')
      .find({ handle: { $in: recipeHandles } })
      .toArray();
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes for date:', error);
    res.status(500).json({ error: 'Failed to fetch recipes for date' });
  }
});

app.delete('/api/recipes/:handle/date/:date', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const { handle, date } = req.params;
    
    const result = await db.collection('scheduledRecipes').deleteOne({
      handle,
      date
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Scheduled recipe not found' });
    }
    
    res.json({ 
      success: true,
      message: 'Recipe removed from date successfully!' 
    });
  } catch (error) {
    console.error('Error removing scheduled recipe:', error);
    res.status(500).json({ error: 'Failed to remove scheduled recipe' });
  }
});

app.delete('/api/recipes/:handle', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const { handle } = req.params;
    
    const result = await db.collection('recipes').deleteOne({ handle });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ 
      success: true,
      message: 'Recipe deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

const port = process.env.PORT || 3000;
(async () => {
  await connectToMongoDB();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
  });
})();

export default app;