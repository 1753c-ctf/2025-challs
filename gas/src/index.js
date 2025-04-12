
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { extractJSONObject } from 'extract-first-json'
import * as cheerio from 'cheerio';
import fetch from 'node-fetch'
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HeaderGenerator } from 'header-generator'


const token = process.env.DISCORD_TOKEN;
const key = process.env.OPENAI_KEY;
const proxy = process.env.PROXY_URL;

import { OpenAI } from "openai";


const chat = new OpenAI({
  apiKey: key
})

const agent = new SocksProxyAgent(proxy);
const hg = new HeaderGenerator();


import NodeCache from "node-cache";


const cache = new NodeCache( { stdTTL: 60 * 30 } );

const stages = [
    `
    P-Bass, by Fender
    Sunburst color
    20 frets
    `,
    `
    A stratocaster, but not by Fender.
    Something Japaneese.
    648 mm scale length.
    With both single coil and humbucker pickups.
    `,
    `
    Bass with 2 humbuckers
    Indian Laurel fretboard
    Long scale
    Sunburst color
    `,
    `
    Short scale Bass
    Green
    4 strings
    2 humbuckers
    Bass VI body
    With pickup selector
    `,
    `
    A 9-strings bass
    Multiscale
    19 frets
    Ultra short scale
    3 single pickups
    Avtive electronics
    2-colour body, pink and blue
    Palisander fretboard
    `

]

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});


client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

function cleanHTML(html) {
  const $ = cheerio.load(html);
  
  $('a').remove();
  $('img').remove();
  $('iframe').remove();
  $('script').remove();
  $('style').remove();
  $('button').remove();
  $('input').remove();
  $('texarea').remove();
  $('form').remove();

  const text = $('body').text();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const cleanedText = lines.join('\n');


  return cleanedText;
}


const fetchPage = async (url) => {
  const headers = hg.getHeaders();
  const response = await fetch(url, { agent, headers: headers });

  if (!response.ok) { return null; }

  const data = await response.text();
  return cleanHTML(data);
}


const checkUrl = async (url, step) => {

  const googlebotUA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  
  try {

    const content = await fetchPage(url);

    if(!content)
      return { meetAllSpecs: false, why: "I can't access this page. Maybe they block true rock'n'roll stars?" };

    const response = await chat.responses.create({
      model: 'gpt-4o',
      instructions: `You should response with only json. The format of the response should be {"meetAllSpecs": false, "why": "<here list all the discrepencies>"} User will paste you a content of a website from a music store. Your role is to visit that link and tell me if the guitar matches exact specification that I will paste here. If any of the specification params are not matched, then you must set meetAllSpecs to false. Don't be too hard about it though, it needs to be close enough, so don't fail on details. Specs that I am looking for are:\n ${stages[step]}`,
      input: content
    });
  
    return extractJSONObject(response.output_text);
  }
  catch (error) {
    console.log(error);
    return { meetAllSpecs: false, why: "Something is off with this website, I have trouble accessing it." };
  }
}

const getResponse = async (message, step, isFirstMessage) => {
    const urls = message.match(/https?:\/\/[^\s]+/g);
    const url = urls ? urls[0] : null;

    if(isFirstMessage)
        return { response: `Hey dude! I need your help. I am looking for a guitar, but not just any guitar. I need something special. Can you help me?\n ${stages[step]}`, nextStep: false };

    if(!url)
        return { response: `I don't see any links to the music stores dude. Really, please help me find it. Just few simlple requirements here:\n ${stages[step]}`, nextStep: false };

    if(url.indexOf("sweetwater.com") > -1)
      return { response: `Dude, sweetwater is okay, but... let's say I did something in there and.. well.. they kind of don't want to sell me stuff anymore... Long story.. I will tell you someday, but we need to find it somewhere else..`, nextStep: false };

    const botResult = await checkUrl(url, step);
    if(!botResult.meetAllSpecs)
        return { response: `Dude, I don't think this is what I am looking for. ${botResult.why}. \n\nRemember, I'm looking for: ${stages[step]}`, nextStep: false };

    if(step == stages.length - 1)
        return { response: `Well.. believe me or not, but I feel like I'm okay now... Look how dope it looks on my wall!\nhttps://1753ctf.com/d7d99ac1-d49c-43c0-af56-8d97663fc1bd.png`, nextStep: false };

    return { response: `Wow, maaan! This is rad! I was looking for exacltly that... But I need one more.. just one more.. I promise..  \n ${stages[step + 1]}`, nextStep: true };
}


client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.channel.isDMBased()) return;

  let userData = cache.get(message.author.id);
  const isFirstMessage = !userData;
  if (!userData) userData = { step: 0 }
  cache.set(message.author.id, userData);

  const processingCacheKey = `PROCESSING_${message.author.id}`;

  if(cache.get(processingCacheKey))
    return message.channel.send("Not so fast dude! I am still processing your last message. Please wait a moment.");
  else
  {
    cache.set(processingCacheKey, true, 30);
  
    await message.channel.sendTyping();
    const { response, nextStep } = await getResponse(message.content, userData.step, isFirstMessage);
    await message.channel.sendTyping();
    await new Promise(resolve => setTimeout(resolve, 10000));
    await message.channel.send(response);

    if(nextStep === true)
    {
        userData.step++;
        cache.set(message.author.id, userData);
    }

    cache.del(processingCacheKey);
  }
});

client.login(token);
