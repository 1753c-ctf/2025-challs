const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const crypto = require('crypto');
const port = 1337;
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const axios = require('axios');

const sessionSecret = crypto.randomBytes(32).toString('hex');
const becomeAdminRoute = crypto.randomBytes(32).toString('hex');

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
  }));
  

app.get('/' + becomeAdminRoute, (req, res) => {
    req.session.admin = true;
    res.end();
})

app.get('/app/admin/flag.pdf', (req, res) => {
    if(req.session.admin == true)
        res.sendFile(path.join(__dirname, 'flag.pdf'));
    else
        res.status(403).send('Access denied');
});

app.get('/report', async (req, res) => {
    var document = req.query.document;
    var token = req.query.token;

    const rckey = "6LfENuMqAAAAACKXzqxsFr5PvFOg1OlBBu_o5_Vf";
    const rcsecret = process.env.rcsecret;

    if(!document) {
        res.status(400).send('No document to report');
    }
    else if(!token) {
        res.send(`
            RECAPTCHING, WAIT...
            <script src="https://www.google.com/recaptcha/api.js?render=${rckey}"></script>
            <script>
                grecaptcha.ready(function() {
                    grecaptcha.execute('${rckey}', {action: 'submit'}).then(function(token) {
                        window.location = window.location + "&token=" + token;
                    });
                });
            </script>
        `)
    }
    else {

        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
              secret: rcsecret,
              response: token
            }
          });

        if(response.data.success && response.data.score > 0.8)
        {
            res.send("Thank you, admin will look into your report soon.");

            try {
                const browser = await puppeteer.launch({
                    headless: true,
                    defaultViewport: null,
                    executablePath: '/usr/bin/google-chrome',
                    args: ['--no-sandbox'],
                 });

                console.log(`getting data for ${document}`);

                const page = await browser.newPage();

                await page.goto('http://localhost:1337/' + becomeAdminRoute);
                await page.waitForNetworkIdle();
                await page.goto('http://localhost:1337?document=' + encodeURI(req.query.document))
                
                await new Promise(resolve => setTimeout(resolve, 30000));
                await page.waitForNetworkIdle();

                await browser.close();
            } catch {}
        }
        else
            res.send("Are you who you say you are?")
    }
    
});

app.use(bodyParser.urlencoded());


app.use("/", express.static(path.join(__dirname, 'static')));

app.use((err, req, res, next) => {
    res.status(500).send('What?');
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});