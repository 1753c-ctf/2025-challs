const express = require('express')
const path = require('path')
const crypto = require('crypto');
const bodyParser = require('body-parser');
const app = express()
const port = 1337
const users = []

setTimeout(() => process.exit(0), 1000 * 60 * 15);

const cats = [
    { 
        id: 1, 
        name: 'Fluffy', 
        image: '/images/fluffly.webp', 
        description: 'You must be thinking what happened to him? He got divorce papers (third this year.', 
        comments: [{ user: 'Janusz', text: 'Gosh, lovely cat' }]
    },
    { 
        id: 2, 
        name: 'Mister Fluffington', 
        image: '/images/juzek.webp', 
        description: 'What bribe do you have for me?', 
        comments: [{ user: 'Janusz', text: 'What a president!' }]
    },
    { 
        id: 3, 
        name: 'Steven', 
        image: '/images/andy.webp', 
        description: 'Can you tell me your fortnite nick? (I know you play)', 
        comments: [{ user: 'Janusz', text: 'janush_2018' }]
    },
    { 
        id: 4, 
        name: 'Bożydar', 
        image: '/images/bozydar.webp', 
        description: 'Just Bożydar .', 
        comments: [{ user: 'Janusz', text: 'Just Janusz' }]
    },
    { 
        id: 5, 
        name: 'Wiliam', 
        image: '/images/XXX.webp', 
        description: 'Rate my dance', 
        comments: [{ user: 'Janusz', text: '0/10, but never give up' }]
    },
    { 
        id: 6, 
        name: 'Professor Purrington', 
        image: '/images/sleepyy.webp', 
        description: 'Hello, you failed',
        comments: [{ user: 'Janusz', text: 'Profesor, your research paper "On the turnover of cat food" is outstanding ' }]
    },
    { 
        id: 7, 
        name: 'Pablo', 
        image: '/images/sucat.webp', 
        description: 'What some funnnnnnnnnnnnn?', 
        comments: [{ user: 'Janusz', text: 'My mom say not, unfortunately. ' }]
    },
    { 
        id: 8, 
        name: 'Lady Meowington', 
        image: '/images/wash.webp', 
        description: 'What are you looking at? Do you want to get a frying pan?',
        comments: [{ user: 'Janusz', text: 'You look like the cat lady in the picture.... I fell in love' }]
    }
   
];

app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
    const user = users.find(u => u.username == req.body.username && u.password == req.body.password);

    if(!user) 
        return res.status(401).send('Invalid credentials');
    
    res.json(user);
})

app.post('/api/register', (req, res) => {

    const existingUser = users.find(u => u.username == req.body.username);
    if(existingUser)
        return res.status(400).send('User already exists');

    if(req.body.role?.toLowerCase() == 'admin')
        return res.status(400).send('Invalid role');

    const user = {
        username: req.body.username.substring(0, 20),
        password: req.body.password.substring(0, 20),
        token: crypto.randomBytes(32).toString('hex'),
        role: req.body.role.substring(0, 20) || 'user'
    }

    users.push(user);

    res.json(user);
})

app.use("/", express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    const token = req.headers["x-token"];
    const user = users.find(u => u.token == token);

    if(!user)
        return res.status(401).send('Unauthorized');

    req.user = user;
    next();
})

app.get('/api/message', (req, res) => {
    if(req.user.role.toUpperCase() === 'ADMIN')
        return res.json({ message: `Hi Admin! Your flag is ${process.env.ADMIN_FLAG}` });
    
    if(req.user.role.toUpperCase() === 'MODERATOR')
        return res.json({ message: `Hi Mod! Your flag is ${process.env.MODERATOR_FLAG}` });

    res.json({ message: `Hello ${req.user.username}` });
})

app.get('/api/cats', (req, res) => {
    res.json(cats);
})

app.post('/api/cats/:id/comment', (req, res) => {
    const cat = cats.find(c => c.id == req.params.id);

    if(!cat)
        return res.status(404).send('Cat not found');

    cat.comments.push({ user: req.user.username, text: req.body.text.substring(0, 200) });

    res.json(cat);
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('What?');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
