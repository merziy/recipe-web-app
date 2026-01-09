import express from 'express';
import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
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

async function connectToMongoDB() {
  try {
    if (!mongoClient) {
      mongoClient = await MongoClient.connect(mongoUrl);
      db = mongoClient.db(dbName);
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

app.post('/api/recipes', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const recipe = req.body;
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

app.post('/api/uploads', async (req, res) => {
  try {
    const { file } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: 'recipes',
      resource_type: 'auto',
    });

    res.json({ 
      success: true,
      url: result.secure_url 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    await connectToMongoDB();
    const dbError = checkDatabase(res);
    if (dbError) return dbError;

    const recipes = await db.collection('recipes').find({}).toArray();
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

export default app;