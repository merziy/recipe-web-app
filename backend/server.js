import express from 'express';
import { MongoClient } from 'mongodb';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const distPath = join(__dirname, '..', 'dist');
const uploadDir = join(__dirname, '..', 'public', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')}`),
});
const upload = multer({ storage });

app.use(express.json());

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

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'recipeApp';
let db;
let mongoClient;

async function connectToMongoDB() {
  try {
    mongoClient = await MongoClient.connect(mongoUrl);
    db = mongoClient.db(dbName);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Server will start but API endpoints will return errors until MongoDB is connected');
  }
}

connectToMongoDB();

app.post('/api/recipes', async (req, res) => {
  try {
    if (checkDatabase(res)) return;
    
    const recipe = req.body;
    const existing = await db.collection('recipes').findOne({ handle: recipe.handle });
    if (existing) {
      return res.status(400).json({ error: 'Recipe already exists' });
    }
    const result = await db.collection('recipes').insertOne(recipe);
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error('Error saving recipe:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/uploads', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    if (checkDatabase(res)) return;
    
    const recipes = await db.collection('recipes').find().toArray();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/recipes/:handle', async (req, res) => {
  try {
    if (checkDatabase(res)) return;
    
    const { handle } = req.params;
    const recipe = req.body;
    const { _id, ...updatable } = recipe;
    const result = await db.collection('recipes').updateOne(
      { handle },
      { $set: updatable }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating recipe:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recipes/:handle/date', async (req, res) => {
  try {
    if (checkDatabase(res)) return;
    
    const { handle } = req.params;
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const recipe = await db.collection('recipes').findOne({ handle });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const alreadyExists = await db.collection('recipeDates').findOne({ 
      recipeHandle: handle, 
      date 
    });
    if (alreadyExists) {
      return res.status(400).json({ error: 'Recipe already saved to this date' });
    }
    
    await db.collection('recipeDates').insertOne({
      recipeHandle: handle,
      date,
      createdAt: new Date()
    });
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error saving recipe to date:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recipes/date/:date', async (req, res) => {
  try {
    if (checkDatabase(res)) return;
    
    const { date } = req.params;
    const dateAssociations = await db.collection('recipeDates').find({ date }).toArray();
    const recipeHandles = dateAssociations.map(assoc => assoc.recipeHandle);
    const recipes = await db.collection('recipes').find({ 
      handle: { $in: recipeHandles } 
    }).toArray();
    
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes for date:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recipes/:handle/date/:date', async (req, res) => {
  try {
    if (checkDatabase(res)) return;
    
    const { handle, date } = req.params;
    const result = await db.collection('recipeDates').deleteOne({ 
      recipeHandle: handle, 
      date 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recipe-date association not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing recipe from date:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recipes/:handle', async (req, res) => {
  try {
    if (checkDatabase(res)) return;

    const { handle } = req.params;
    const result = await db.collection('recipes').deleteOne({ handle });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    await db.collection('recipeDates').deleteMany({ recipeHandle: handle });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting recipe:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/uploads', express.static(uploadDir));

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile('index.html', { root: distPath });
  });
} else {
  console.log('dist folder not found — skipping static SPA serving (development mode)');
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
