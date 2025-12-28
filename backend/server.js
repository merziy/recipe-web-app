import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const path = __dirname + '/../dist/';

app.use(express.json());
app.use(express.static(path));

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'recipeApp';
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
    const recipe = req.body;
    if (!db) {
      console.error('Database not connected');
      return res.status(503).json({ error: 'Database not connected. Please check if MongoDB is running.' });
    }
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

app.get('/api/recipes', async (req, res) => {
  try {
    if (!db) {
      console.error('Database not connected');
      return res.status(503).json({ error: 'Database not connected. Please check if MongoDB is running.' });
    }
    const recipes = await db.collection('recipes').find().toArray();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.sendFile(`${path}index.html`);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
