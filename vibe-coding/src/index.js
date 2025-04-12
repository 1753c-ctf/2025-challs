const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const port = 1337;
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
const OpenAI = require('openai');
const ivm = require('isolated-vm');

let isolate = new ivm.Isolate({ memoryLimit: 8 });

const sessionSecret = crypto.randomBytes(32).toString('hex');
const signartureSecret = crypto.randomBytes(32).toString('hex');


const openai = new OpenAI({
    apiKey: process.env.openai_key,
});

app.use(bodyParser.json());


app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { true: false, maxAge: 1000 * 60 * 15 }
}));

app.get("/", (req, res, next) => {
    if(req.session.data) 
        req.session.data.threadId = undefined;

    req.session.save();
    next();
});

app.use("/", express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {

    if (!req.body.token)
        return res.status(400).send('Well, maybe you should try to send a token?');

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
            secret: process.env.rcsecret,
            response: req.body.token
        }
    });

    if (!response.data.success || response.data.score < 0.3)
        return res.status(400).send('I am not a human, but you should be!');

    if (!req.session.data) {
        req.session.data = {
            spawned: Date.now(),
            lastRequest: 0
        };
    }

    if (req.session.data.lastRequest > Date.now() - 1000 * 5)
        return res.status(429).send('You are sending too many requests, please wait a bit!');

    req.session.data.lastRequest = Date.now();

    req.session.save();

    next();
})

app.post('/api/msg', async (req, res) => {
    try {
        if (!req.body.msg)
            return res.status(400).send('No message to send');

        const threadId = req.session.data?.threadId || (req.session.data.threadId = (await openai.beta.threads.create()).id);

        const runs = await openai.beta.threads.runs.list(threadId);
        const currentRun = runs.data.find(run =>
            ["queued", "in_progress"].includes(run.status)
        );

        if (currentRun)
            return res.status(429).send('Not soooo fast there, buddy!');

        await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: req.body.msg,
        });

        let run = await openai.beta.threads.runs.create(threadId, { assistant_id: process.env.assistant_id });

        while (run.status !== 'completed') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            run = await openai.beta.threads.runs.retrieve(threadId, run.id);
        }

        const { data } = await openai.beta.threads.messages.list(threadId, {
            run_id: run.id,
            role: 'assistant',
        });

        const result = JSON.parse(data[0].content[0]?.text?.value);
        result.signature = crypto.createHmac('sha256', signartureSecret).update(result.code).digest('hex');

        res.send(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).send('What?');
    }
});

app.post('/api/run', async (req, res) => {
    try {

        if (!req.body.code)
            return res.status(400).send('No code to run');

        const signature = crypto.createHmac('sha256', signartureSecret).update(req.body.code).digest('hex');
        if (signature !== req.body.signature)
            return res.status(400).send('Dat aint my code!');

        const fn = `const getFlag = () => "${process.env.flag ?? '1753c{fake_flag_for_testing}'}";`
        const code = fn + "\n\n\n\n\n\n"  + req.body.code;

        let result = "Well, something went terribly wrong here...";
        try {
            if(isolate.isDisposed)
                isolate = new ivm.Isolate({ memoryLimit: 8 });

            const context = await isolate.createContext();
            const script = await isolate.compileScript(code);
            result = await script.run(context);
        }
        catch (e) {
            result = "EXCEPTION: " + e.message;
        }

        return res.status(200).send(result || "Well, actually... this code retuned nothing :|");
    }
    catch (error) {
        console.log(error);
        return res.status(500).send('What?');
    }
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('What?');
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});