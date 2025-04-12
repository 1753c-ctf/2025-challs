const express = require('express');
const path = require('path');
const app = express();
const port = 1337;

// Serve static files
app.use(express.static('public'));

// API endpoints
app.get('/api/v1.05.1753/categories', (req, res) => {
  const { exec } = require('child_process');
  
  exec('/usr/games/fortune -f', (error, stdout, stderr) => {
    if (error || stderr === '') {
      return res.status(500).send("Internal server error");
    }

    const categories = stderr
      .split('\n')
      .filter(line => line.includes('%') && !line.includes('/'))
      .map(line => {
        const match = line.trim().match(/%\s*(.*)/);
        if (match) {
          // Capitalize first letter
          const name = match[1].trim();
          return name.charAt(0).toUpperCase() + name.slice(1);
        }

        return null;
      })
      .filter(Boolean);
    
    res.json(categories);
  });
});


app.get('/api/v1.05.1753/fortune', (req, res) => {
  const category = req.query.category?.toLowerCase();
  if(!category) return res.status(400).send("Missing category parameter");
  
  const { exec } = require('child_process');

  if(category.match(/[^a-zA-Z0-9]/))
    return res.status(400).send("Invalid category parameter");

  exec(`/usr/games/fortune ${category}`, (error, stdout, stderr) => {
    if (error || stderr) {
      return res.status(500).send("Internal server error");
    }
    res.send(stdout.replaceAll('\n', '<br>'));
  });
 });

 app.get('/api/v1.03.410/verify-my-flag/:secret', (req, res) => {
  const secret = req.params.secret;
  const path = require('path');
  const { exec } = require('child_process');
  
  const flagPath = path.join(__dirname, 'flag');
  
  exec(`${flagPath} ${secret}`, (error, stdout, stderr) => {
    if (error || stderr) {
      return res.status(500).send("Internal server error");
    }

    try {
      res.json({ result: stdout.trim() });
    } catch (e) {
      res.status(500).send("Internal server error");
    }
  });
 });

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  res.status(500).send('What?');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});