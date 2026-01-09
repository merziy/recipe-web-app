import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';

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
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

let connectionPromise;

async function connectToMongoDB() {
  if (!connectionPromise) {
    connectionPromise = MongoClient.connect(mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000,
    });
  }
  
  try {
    const client = await connectionPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    connectionPromise = null;
    throw error;
  }
}

const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'recipeApp';

const withTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
};

app.get('/api/health', async (req, res) => {
  try {
    await connectToMongoDB();
    if (db) {
      await db.admin().ping();
      res.json({ status: 'healthy', db: 'connected' });
    } else {
      res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const recipe = req.body;
    const result = await withTimeout(
      db.collection('recipes').insertOne(recipe),
      5000
    );
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

app.get('/api/recipes', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const recipes = await withTimeout(
      db.collection('recipes').find({}).toArray(),
      5000
    );
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.put('/api/recipes/:handle', async (req, res) => {
  try {
    const db = await connectToMongoDB();
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
    const db = await connectToMongoDB();
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
    
    const scheduledRecipes = await withTimeout(
      db.collection('scheduledRecipes').find({ date }).toArray(),
      5000
    );
    
    const recipeHandles = scheduledRecipes.map(sr => sr.handle);
    const recipes = await withTimeout(
      db.collection('recipes').find({ handle: { $in: recipeHandles } }).toArray(),
      5000
    );
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes for date:', error);
    res.status(500).json({ error: 'Failed to fetch recipes for date' });
  }
});

app.delete('/api/recipes/:handle/date/:date', async (req, res) => {
  try {
    const db = await connectToMongoDB();
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
    const db = await connectToMongoDB();

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
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});

export default app;