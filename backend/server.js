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

MongoClient.connect(mongoUrl)
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });


app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = req.body;
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    const result = await db.collection('recipes').insertOne(recipe);
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    const recipes = await db.collection('recipes').find().toArray();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.sendFile(`${path}index.html`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
