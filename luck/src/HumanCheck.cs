using System.Net;
using EasyCaching.Core;
using EasyCaching.Disk;
using EasyCaching.Serialization.Json;
using FuzzySharp;
using Newtonsoft.Json;

static class HumanCheck
{
    private static readonly Random _random = new();
    private static readonly string[] _questionPrefixes =
    [
        "Can you tell me ",
        "Now the question I have for you is ",
        "So, a question: ",
        "Hey buddy, answer this: ",
        "Quick one for ya: ",
        "Let me ask: ",
        "Time for a simple question: ",
        "I'm curious about ",
        "Tell me if you know: ",
        "Here's a question for you: ",
        "I wonder if you know ",
        "Let's see if you can answer: ",
        "Question time! ",
        "Could you answer ",
        "I'd like to know ",
        "A simple one: ",
        "Answer me this: ",
        "I've been wondering: ",
        "Tell me about ",
        "I need to know ",
        "Riddle me this: ",
        "Just checking: ",
        "Any idea ",
        "Do you happen to know ",
        "Joker wants to know: ",
        "For the curious mind: ",
        "A quick brain teaser: ",
        "Be a dear and tell me ",
        "Out of curiosity: ",
        "Mind telling me ",
        "Care to share ",
        "Enlighten me about ",
        "Just between us: ",
        "Random question: ",
        "Hey, human! ",
        "Since you're human, you should know: ",
        "Real people know this one: ",
        "This is simple for real folks: ",
        "Humans typically know ",
        "A common knowledge question: ",
        "If you're human, you'll know: ",
        "No robot can answer this: ",
        "This should be easy if you're human: ",
        "For the human brain: ",
        "Humans learn this early: ",
        "Only flesh and blood would know: ",
        "Bots struggle with this one: ",
        "Here's a human check: ",
        "Prove your humanity: ",
        "Last check before we play: "
    ];

    private static readonly HttpClient _httpClient = new HttpClient();

    private static readonly EasyCachingAbstractProvider _cache =
        new DefaultDiskCachingProvider("cache",
        [new DefaultJsonSerializer("cache", new JsonSerializerSettings())],
        new DiskOptions
        {
            DBConfig = new DiskDbOptions
            {
                BasePath = "disk_cache"
            }
        }, null);

    private const string API_URL = "https://the-trivia-api.com/v2/questions?limit=50&type=text_choice";
    private const string CACHE_KEY = "trivia_questions";
    private const int CACHE_MINUTES = 2;

    // just a fallback for when the API is down
    private static string staticResponse = @"[{'category':'history','id':'622a1c367cc59eab6f950334','correctAnswer':'George VI','incorrectAnswers':['Henry VIII','Elizabeth I','William II'],'question':{'text':'Who was the monarch of England before Elizabeth II?'},'tags':['history'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'history','id':'622a1c347cc59eab6f94f9c7','correctAnswer':'Jimmy Carter','incorrectAnswers':['George W. Bush','Ronald Reagan','Grover Cleveland'],'question':{'text':'Who was the 39th president of the USA, in term during the period 1977–1981?'},'tags':['usa','presidents','leaders','history'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'general_knowledge','id':'622a1c357cc59eab6f94fc68','correctAnswer':'Obelus','incorrectAnswers':['Gibberish','Donkey Engine','Taradiddle'],'question':{'text':'Which word is defined as 'the symbol ÷'?'},'tags':['words','general_knowledge'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'history','id':'649f220febb41911d4cbd6c5','correctAnswer':'Dunkirk','incorrectAnswers':['Calais','Le Havre','Brest'],'question':{'text':''We shall fight on the beaches', is a quote from Winston Churchill immediately following the evacuation from which French port?'},'tags':['speeches','history','world_war_2'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c367cc59eab6f950194','correctAnswer':'Madame Butterfly','incorrectAnswers':['Swan Lake','HMS Pinafore','Candide'],'question':{'text':'In what opera would you find Lt. Pinkerton?'},'tags':['arts_and_literature'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'food_and_drink','id':'64e6fd5e0b79e5bedd55c87e','correctAnswer':'Menudo','incorrectAnswers':['Gazpacho','Pho','Gumbo'],'question':{'text':'Which of these is a Mexican tripe soup?'},'tags':['mexican_cuisine','mexico','food_and_drink','food','soups'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'geography','id':'63b058684799123c67712f1e','correctAnswer':'Edinburgh','incorrectAnswers':['Aberdeen','Glasgow','Cardiff'],'question':{'text':'What is the capital of Scotland?'},'tags':['uk','capital_cities','cities','scotland','geography'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c347cc59eab6f94fa45','correctAnswer':'Rococo','incorrectAnswers':['Italian Renaissance','Northern Renaissance','Washington Color School'],'question':{'text':'The painting \'The Swing\' by Eugène Delacroix is a part of which art movement?'},'tags':['art','painting','arts_and_literature'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'music','id':'64b5a8837282fc9eadbafd9f','correctAnswer':'Hi-hat','incorrectAnswers':['Snare','Ride cymbals','Tom-tom'],'question':{'text':'What is the name of the pair of cymbals on a drum kit controlled by a foot pedal?'},'tags':['music','musical_instruments'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c397cc59eab6f950f51','correctAnswer':'Jules Verne','incorrectAnswers':['Victor Hugo','Alphonse Daudet','Edgar Rice Burroughs'],'question':{'text':'Which author wrote 'A Journey to the Center of the Earth'?'},'tags':['arts_and_literature'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'music','id':'622a1c357cc59eab6f94fe76','correctAnswer':'Britney Spears','incorrectAnswers':['Madonna','Alanis Morissette','Nicki Minaj'],'question':{'text':'Which American singer, songwriter, dancer and actress released the studio album 'Glory'?'},'tags':['music_albums','music'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'history','id':'622a1c3c7cc59eab6f9519ca','correctAnswer':'New Zealand','incorrectAnswers':['Hawaii','Japan','Mauritius'],'question':{'text':'What land did Abel Tasman 'discover' in 1642?'},'tags':['1600's','general_knowledge','history'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'music','id':'622a1c367cc59eab6f95038f','correctAnswer':'Bing Crosby','incorrectAnswers':['John Lennon','Aretha Franklin','Madonna'],'question':{'text':'Who did David Bowie duet with on the Christmas Hit 'Little Drummer Boy''?'},'tags':['music'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'science','id':'622a1c3a7cc59eab6f9510fb','correctAnswer':'Loudness','incorrectAnswers':['Light','Radiation','Electrical Resistance'],'question':{'text':'A Phon is a unit of what?'},'tags':['words','science'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c397cc59eab6f950e26','correctAnswer':'Philip Pullman','incorrectAnswers':['J. R. R. Tolkien','Christopher Tolkien','Neil Gaiman'],'question':{'text':'Which author wrote 'Northern Lights'?'},'tags':['young_adult','literature','arts_and_literature'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'food_and_drink','id':'622a1c367cc59eab6f950234','correctAnswer':'Ronald Mcdonald','incorrectAnswers':['The King','Donald Burger','Meato'],'question':{'text':'Who is McDonald's mascot?'},'tags':['business','advertising','fictitious_characters','food_and_drink'],'type':'text_choice','difficulty':'easy','regions':[],'isNiche':false},{'category':'sport_and_leisure','id':'640747c0658741a165677ea2','correctAnswer':'3 meters','incorrectAnswers':['2 meters','1 meter','4 meters'],'question':{'text':'What is the height of a basketball hoop in competitions?'},'tags':['basketball','sport'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'history','id':'622a1c377cc59eab6f950451','correctAnswer':'The Submarine','incorrectAnswers':['The Torpedo','TNT','The Tank'],'question':{'text':'Designed By Robert Fulton, Which Weapon Was Tested In The Seine In 1801?'},'tags':['inventions','technology','history'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'science','id':'622a1c3e7cc59eab6f952229','correctAnswer':'Jurassic','incorrectAnswers':['Triassic','Cretaceous','Devonian'],'question':{'text':'In which time period did the diplodocus live?'},'tags':['science','geology','dinosaurs'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'music','id':'645cb19b7d263fd5097043e5','correctAnswer':'Nile Rodgers','incorrectAnswers':['Quincy Jones','Phil Spector','George Martin'],'question':{'text':'Who produced David Bowie's 1983 album \'Let's Dance\'?'},'tags':['producers','music','music_albums'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c397cc59eab6f950e25','correctAnswer':'Philip Pullman','incorrectAnswers':['J. R. R. Tolkien','Christopher Tolkien','Neil Gaiman'],'question':{'text':'Which author wrote 'The Amber Spyglass'?'},'tags':['arts_and_literature'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'sport_and_leisure','id':'62417d280f96c4efe8d773aa','correctAnswer':'Houston Dynamo','incorrectAnswers':['Houston Saints','Houston Islanders','Houston Fire'],'question':{'text':'Which of these is a soccer team based in Houston?'},'tags':['sport'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'music','id':'622a1c397cc59eab6f950c97','correctAnswer':'The Rolling Stones','incorrectAnswers':['McFly','Delirious?','Depeche Mode'],'question':{'text':'Which English rock band released the song 'Sympathy for the Devil'?'},'tags':['music'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'film_and_tv','id':'62573fda9da29df7b05f73b1','correctAnswer':'A suburban father has a mid-life crisis after becoming infatuated with his daughter's friend.','incorrectAnswers':['A mother personally challenges the local authorities to solve her daughter's murder.','A surgeon rescues a disfigured man who is mistreated while scraping a living as a side-show freak.','A woman works with a hardened boxing trainer to become a professional.'],'question':{'text':'What is the plot of the movie American Beauty?'},'tags':['film','film_and_tv'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c347cc59eab6f94fa47','correctAnswer':'Dutch and Flemish Renaissance','incorrectAnswers':['Dadaism','Primitivism','post-impressionism'],'question':{'text':'The painting \'The Tower of Babel\' by Pieter Bruegel the Elder is a part of which art movement?'},'tags':['painting','art'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'history','id':'622a1c3b7cc59eab6f9516f9','correctAnswer':'Francisco Coronado','incorrectAnswers':['Francisco Pizzaro','Hernando de Soto','Jose Garrido'],'question':{'text':'Which Spanish conquistador's expedition marked the first European sighting of the Grand Canyon?'},'tags':['history','people','exploration','usa','natural_wonders'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c397cc59eab6f950e53','correctAnswer':'Washington Irving','incorrectAnswers':['Suzanne Collins','James Fenimore Cooper','Donna Leon'],'question':{'text':'Which author wrote 'Rip Van Winkle'?'},'tags':['literature','arts_and_literature'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'general_knowledge','id':'6461407e4d46e537ca8cd9e7','correctAnswer':'\'You can't have your cake and eat it too\'','incorrectAnswers':['\'Waste not, want not\'','\'A penny saved is a penny earned\'','\'Actions speak louder than words\''],'question':{'text':'Which phrase is often used to mean that one cannot use something up and still have it available afterwards?'},'tags':['phrases','general_knowledge'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'society_and_culture','id':'63b0586d4799123c67712f27','correctAnswer':'Rupee','incorrectAnswers':['Dollar','Yen','Ren'],'question':{'text':'What is the currency of India?'},'tags':['india','currency','society_and_culture'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'science','id':'6462621bab138b829b81e9d2','correctAnswer':'Giant Kelp','incorrectAnswers':['Giant Algae','Giant Kombu','Giant Sea Lettuce'],'question':{'text':'What is the largest seaweed?'},'tags':['botany','plants','science'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'society_and_culture','id':'63b0587b4799123c67712f3e','correctAnswer':'Unicorn','incorrectAnswers':['Lion','Dragon','Horse'],'question':{'text':'What is the national animal of Scotland?'},'tags':['uk','scotland','animals','society_and_culture'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'geography','id':'622a1c387cc59eab6f950a01','correctAnswer':'Thailand','incorrectAnswers':['Cambodia','Vietnam','Laos'],'question':{'text':'Which of these countries borders Malaysia?'},'tags':['geography'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'society_and_culture','id':'622a1c367cc59eab6f9500e4','correctAnswer':'Jacob','incorrectAnswers':['Joshua','Aaron','Michael'],'question':{'text':'Whose name did God change to Israel?'},'tags':['christianity','society_and_culture'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'history','id':'622a1c3c7cc59eab6f951ac3','correctAnswer':'Anne Boleyn','incorrectAnswers':['Mary, Queen of Scots','Queen Victoria','Catherine of Aragon'],'question':{'text':'Who was Queen Elizabeth I's Mother?'},'tags':['history'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'history','id':'622a1c3c7cc59eab6f951882','correctAnswer':'Harvard','incorrectAnswers':['Stanford','Cornell','UCLA'],'question':{'text':'Founded in 1636, what is the oldest university in the USA? '},'tags':['usa','records','history'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'society_and_culture','id':'62c2f9eeb3eadb0437fda6b1','correctAnswer':'Bat','incorrectAnswers':['Lion','Horse','Crocodile'],'question':{'text':'Which animal would you associate with the Bacardi logo?'},'tags':['society_and_culture','business','marketing','animals','logos','symbols','drink','alcohol','food_and_drink'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'food_and_drink','id':'622a1c367cc59eab6f95027e','correctAnswer':'The dent on the base ','incorrectAnswers':['The neck','The curve leading to the neck','The foil covering the cork'],'question':{'text':'What, on a bottle of wine, is the punt?'},'tags':['words','drink','food_and_drink'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'food_and_drink','id':'64824df37778562fd76a95ea','correctAnswer':'Caramelization','incorrectAnswers':['Frying','Boiling','Blanching'],'question':{'text':'What cooking process involves cooking ingredients containing sugar on a low heat to alter the flavour and color?'},'tags':['food','cooking','food_and_drink'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'science','id':'6462621bab138b829b81e9ca','correctAnswer':'Gluteal','incorrectAnswers':['Abdominal','Bicep','Pectoral'],'question':{'text':'What is the name used for the group of muscles around the buttocks?'},'tags':['science','anatomy','medicine'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c397cc59eab6f950ea2','correctAnswer':'Alexandre Dumas','incorrectAnswers':['Anatole France','Gustave Flaubert','Charles Perrault'],'question':{'text':'Which author wrote 'The Three Musketeers'?'},'tags':['arts_and_literature'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'history','id':'6497ef4d0752843c0d8aadd5','correctAnswer':'The Bubonic Plague','incorrectAnswers':['The Spanish Flu','Smallpox','Cholera'],'question':{'text':'Which epidemic hit London in the 17th century, killing tens of thousands of people each time?'},'tags':['diseases','epidemiology','history','london','1600s','1600's'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'music','id':'622a1c397cc59eab6f950cf7','correctAnswer':'The Beatles','incorrectAnswers':['Deep Purple','Feeder','Uriah Heep'],'question':{'text':'Which English rock band released the song 'Revolution'?'},'tags':['music'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'society_and_culture','id':'6502100c2b411b896c984b1b','correctAnswer':'Honolulu','incorrectAnswers':['Los Angeles','New York City','Tokyo'],'question':{'text':'Which city is home to ALA Moana, also known as \'the world's largest open-air shopping center\'?'},'tags':['shopping','cities','society_and_culture','places'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'film_and_tv','id':'622a1c347cc59eab6f94f91c','correctAnswer':'Daniel Day-Lewis','incorrectAnswers':['Peter O'Toole','Sidney Poitier','Robert De Niro'],'question':{'text':'Which actor played the role of William 'Bill the Butcher' Cutting in Gangs of New York?'},'tags':['acting','film','people','film_and_tv'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'arts_and_literature','id':'622a1c3a7cc59eab6f951387','correctAnswer':'Harry Potter','incorrectAnswers':['Voyages Extraordinaires','Percy Jackson & the Olympians','Twilight'],'question':{'text':'In which book series does 'Cedric Diggory' appear?'},'tags':['arts_and_literature'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'film_and_tv','id':'622a1c347cc59eab6f94f8cc','correctAnswer':'Frances McDormand','incorrectAnswers':['Anne Bancroft','Judy Garland','Bette Davis'],'question':{'text':'Which actress played the role of Marge Gunderson in Fargo?'},'tags':['acting','film_and_tv'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'general_knowledge','id':'622a1c367cc59eab6f950400','correctAnswer':'Bethlehem','incorrectAnswers':['Jerusalem','Jericho','Babylon'],'question':{'text':'The name of which place of biblical significance actually means 'House of Bread'''},'tags':['general_knowledge'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'society_and_culture','id':'63bc3fb60e893d6e5a6a0fe6','correctAnswer':'Preppy','incorrectAnswers':['Grunge','Hippie','Gothic'],'question':{'text':'What is the name of the fashion trend popularized in the 1950s that involves wearing cardigans, loafers, and pleated skirts?'},'tags':['society_and_culture','fashion','1950's'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false},{'category':'film_and_tv','id':'622a1c347cc59eab6f94fb2f','correctAnswer':'The Hurt Locker','incorrectAnswers':['Avatar','The Blind Side','District 9'],'question':{'text':'Which film won the Academy Award for Best Picture in 2009?'},'tags':['academy_awards','film','film_and_tv'],'type':'text_choice','difficulty':'hard','regions':[],'isNiche':false},{'category':'science','id':'622a1c377cc59eab6f9504b1','correctAnswer':'plankton','incorrectAnswers':['interactions among organisms and the water cycle','the Islam','society'],'question':{'text':'What is Planktology the study of?'},'tags':['words','science'],'type':'text_choice','difficulty':'medium','regions':[],'isNiche':false}]";



    public static async Task<bool> VerifyHuman()
    {

        var answered = false;

        while (!answered)
        {
            var triviaQuestions = await GetTriviaQuestions();
            if (triviaQuestions == null || triviaQuestions.Count == 0)
            {
                Console.WriteLine("Joker: Hmm, having trouble with my questions. Let's try again later.");
                return false;
            }

            var questionEntry = triviaQuestions[_random.Next(triviaQuestions.Count)];
            var question = questionEntry.Question.Text;
            var answer = questionEntry.CorrectAnswer;
            var prefix = _questionPrefixes[_random.Next(_questionPrefixes.Length)];

            Console.WriteLine($"Joker: {prefix}{question}");
            Console.Write("Your answer: ");
            var userAnswer = Console.ReadLine()?.Trim().ToLower() ?? "";

            // Use FuzzySharp to check if the answer is "close enough"
            var answerWords = answer.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var userWords = userAnswer.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            bool isCorrect = false;
            foreach (var answerWord in answerWords)
            {
                foreach (var userWord in userWords)
                {
                    var ratio = Fuzz.Ratio(answerWord.ToLower(), userWord.ToLower());
                    if (ratio >= 70) // 70% similarity threshold
                    {
                        isCorrect = true;
                        break;
                    }
                }
                if (isCorrect) break;
            }

            Console.WriteLine($"Joker: Wait...");
            await Task.Delay(5000);

            if (isCorrect)
            {
                Console.WriteLine("Joker: Good! That's right.");
                answered = true;
            }
            else
            {
                Console.WriteLine("Joker: Nope, that's not it. Let's try another one.");
            }
        }

        return true;
    }

    private static async Task<List<TriviaQuestion>> GetTriviaQuestions()
    {
        List<TriviaQuestion> result;

        _httpClient.Timeout = TimeSpan.FromSeconds(5);

        try
        {
            result = (await _cache.GetAsync(CACHE_KEY, async () =>
            {
                var response = await _httpClient.GetStringAsync(API_URL);
                var questions = JsonConvert.DeserializeObject<List<TriviaQuestion>>(response)!;
                return questions;
            }, TimeSpan.FromMinutes(CACHE_MINUTES))).Value;
        }
        catch (Exception ex)
        {
            result = JsonConvert.DeserializeObject<List<TriviaQuestion>>(staticResponse.Replace("'", "\""))!;
        }

        return result;
    }
}


public class TriviaQuestion
{
    public required string CorrectAnswer { get; set; }
    public required QuestionText Question { get; set; }
}

public class QuestionText
{
    public required string Text { get; set; }
}