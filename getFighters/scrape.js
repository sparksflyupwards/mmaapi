const axios = require('axios');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')
const lineReader = require('line-reader');
const { resolve } = require('path');
const MongoClient = require('mongodb').MongoClient;



const ufc_fighters = [];

const scrapeAllFighers = async ()=>{
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const baseLink = "http://ufcstats.com/statistics/fighters?char="

    for(letter of letters){

        let count = 1;
        let stayOnLetter = true;
        while(stayOnLetter){
            let url = baseLink+letter+"&page=" + count;
            //console.log(url)
            count++
            await axios.get(url).then((response)=>{
 
                $ = cheerio.load(response.data);
                //parses through each table cell if there are cells on this page else ends scraping of the letter
                const table_row_selector = 'body > section > div > div > div > table > tbody > tr'
                if($(table_row_selector).length <= 1){
                    stayOnLetter = false;
                    console.log("For letter: "+ letter + " finished with num of pages: " + (count - 2 ))
                }
                table_body =  $(table_row_selector).each((i, elem) => {
                   
               
                
                    //format the elements data into an array slicing out the spaces
                    table_row = $(elem).text();
                    table_row_array  = table_row.split("\n").filter((str)=>{return /\S/.test(str)});
                    table_row_array=table_row_array.map((str)=>{ return str.trim()});
     
                    //find link for more figher info
                    let link = $(elem).children('.b-statistics__table-col').children().attr('href');
                      
                    
                    //if link undefined then the row is not a figher
                    let fighter_id = "";
                    if(link){
                        fighter_id =  link.slice(36,)
                    }
                    else {
                        return;
                    }
                        
                    //formulate the figher into an object
                    let fighter = {
                        name: table_row_array[0] + " " + table_row_array[1],
                        nick_name: table_row_array[2],
                        height: table_row_array[3],
                        weight: table_row_array[4],
                        reach: table_row_array[5],
                        stance: table_row_array[6],
                        total_wins: table_row_array[7],
                        total_losses: table_row_array[8],
                        total_draws: table_row_array[9],
                        fighter_id: fighter_id,
                        link: link
    
                    }
                    ufc_fighters.push(fighter);
                    //console.log(fighter)
                    return
                })
    
            })
        }
       
    }

    return ufc_fighters;
    
}

/** 
scrapeAllFighers().then((ufc_fighters)=>{
    


    const writeFigthersToDB = ()=>{
        const db_url = 'mongodb://127.0.0.1:27017';
        MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if (err) {
                return console.log(err);
            }
        
            // Specify database you want to access
            const db = client.db('FightStats');

            const fighters = db.collection('fighters');
            fighters.insertMany(ufc_fighters, (err, result) => { console.log(err); });
        
            console.log(`MongoDB Connected: ${url}`);
        });

    }

    const writeFightersToFile = ()=>{
        fs.appendFileSync('fighters.txt', JSON.stringify(ufc_fighters),
        (err)=>{
           if (err) throw err;
           console.log('Saved!');
         });
    }
 
});
*/


const writeFigthersToDB = async ()=>{
    let ufc_fighters =[
        {
            name: 'Cyril Asker',
            nick_name: 'Silverback',
            height: `6' 0"`,
            weight: '247 lbs.',
            reach: '74.0"',
            stance: 'Orthodox',
            total_wins: '9',
            total_losses: '4',
            total_draws: '0',
            fighter_id: '9be6020024133293',
            link: 'http://ufcstats.com/fighter-details/9be6020024133293'
          },
          {
            name: 'Khusein Askhabov',
            nick_name: 'Lion',
            height: `5' 8"`,
            weight: '145 lbs.',
            reach: '--',
            stance: '23',
            total_wins: '0',
            total_losses: '0',
            total_draws: undefined,
            fighter_id: '5c10da56d712ac9c',
            link: 'http://ufcstats.com/fighter-details/5c10da56d712ac9c'
          },
          {
            name: 'Scott Askham',
            nick_name: `6' 3"`,
            height: '185 lbs.',
            weight: '75.0"',
            reach: 'Southpaw',
            stance: '14',
            total_wins: '4',
            total_losses: '0',
            total_draws: undefined,
            fighter_id: '06827d70c53ff0d9',
            link: 'http://ufcstats.com/fighter-details/06827d70c53ff0d9'
          },
          {
            name: 'Ben Askren',
            nick_name: 'Funky',
            height: `5' 11"`,
            weight: '170 lbs.',
            reach: '73.0"',
            stance: 'Orthodox',
            total_wins: '19',
            total_losses: '2',
            total_draws: '0',
            fighter_id: '0b31f87be71ebbb1',
            link: 'http://ufcstats.com/fighter-details/0b31f87be71ebbb1'
          },
          {
            name: 'Josh Appelt',
            nick_name: `5' 10"`,
            height: '255 lbs.',
            weight: '--',
            reach: 'Southpaw',
            stance: '15',
            total_wins: '7',
            total_losses: '0',
            total_draws: undefined,
            fighter_id: '0c1a04afca64e38f',
            link: 'http://ufcstats.com/fighter-details/0c1a04afca64e38f'
          }

    ]

    /** 
    const db_url = 'mongodb://127.0.0.1:27017';
    MongoClient.connect(db_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) {
            return console.log(err);
        }
    
        // Specify database you want to access
        const db = client.db('FightStats');

        const fighters = db.collection('fighters');
        fighters.find().toArray((err, results) => {
            console.log(results);
        });
         fighters.insertMany(ufc_fighters, (err, result) => { console.log(err); });
         fighters.find().toArray((err, results) => {
            console.log(results);
        });
        console.log(`MongoDB Connected: ${url}`);
    });
    */

    const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:<<<PASSWORD>>>@cluster0.ks3d7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
await client.connect(async (err) => {
  const fighters = client.db("MMAStats").collection("fighters");
  await fighters.insertMany(ufc_fighters, (err, result) => { console.log(err); });
  // perform actions on the collection object
  client.close();
});



}

writeFigthersToDB().then((res)=>{
console.log(res)
});


