const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const rl = readline.createInterface({ input: stdin, output: stdout });

console.log("Wir usen Node " + process.version);

async function go() {
    const allowedChars = "+![]{}() "
    const answer = await rl.question("Gib mich eine kleine password:");
    
    if([...answer].some(c => allowedChars.indexOf(c) < 0))
    {
        console.log("Well, well, well... das input ist unallowed!");
        process.exit(0);
    }

    if(answer.length > 184)
    {
        console.log("Deine password ist too lange! Try einmal!");
        process.exit(0);
    }

    let pass;

    try {
        pass = eval(answer).toString().toLowerCase();
    } catch(err) {
        console.log(`Nein! ${err}`);
        process.exit(0);
    }
    
    if(pass != "bananafruit")
    {
        console.log(`Password ${pass} nicht korrekt!`);
        process.exit(0);
    }
    
    console.log(`Oooooh, flag ist ${process.env.flag}`);
    process.exit(0);
}

go();

//https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#banana
//([]+{})[(+!![]+ +!![])]+(![]+[])[+!![]]+(+{})+(![]+[])[+!![]]+(![]+[])[+[]]+(!![]+[])[+!![]]+(!![]+[])[(+!![]+ +!![])]+(([][[]]+[])[(+!![]+ +!![]+ +!![]+ +!![]+ +!![])])+(!![]+[])[+[]]
