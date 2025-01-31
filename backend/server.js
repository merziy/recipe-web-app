import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
const path = __dirname + '/dist/';

// Serve static files
app.use(express.static(path));

app.get('*', (req, res) => {
  res.sendFile(`${path}index.html`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
