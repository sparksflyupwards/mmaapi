const axios = require('axios');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')
const lineReader = require('line-reader');
const { resolve } = require('path');
const MongoClient = require('mongodb').MongoClient;



const ufc_fighters = [];

const scrapeAllFighers = async ()=>{
    const letters = "AB"
    //CDEFGHIJKLMNOPQRSTUVWXYZ"
    const baseLink = "http://ufcstats.com/statistics/fighters?char="
    
   

    for(letter of letters){

        let count = 1;
        let stayOnLetter = true;    
        while(stayOnLetter){
            let url = baseLink+letter+"&page=" + count;
            console.log(url)
            count++;
            await axios.get(url).then((response)=>{
    
                $ = cheerio.load(response.data);
                //parses through each table cell if there are cells on this page else ends scraping of the letter
                const table_row_selector = 'body > section > div > div > div > table > tbody > tr';

                if($(table_row_selector).length <= 1){
                    stayOnLetter = false;
                    console.log("For letter: "+ letter + " finished with num of pages: " + (count - 2 ))
                    return false;
                }

                table_body =  $(table_row_selector).each((i, elem) => {
                    console.log($(elem).children('.b-statistics__table-col').children().text().attr)
                    
                    //format the elements data into an array slicing out the spaces
                    table_row = $(elem).text();
                    const row_to_array_by_spaces = table_row.split("\n");
                    let row_to_array_pruned = [];
                    
                    //find link for more figher info
                    let link = $(elem).children('.b-statistics__table-col').children().attr('href');
                    console.log("link")
                    console.log(link)
                    
                    //if link undefined then the row is not a figher
                    let fighter_id = "";
                    if(link){
                        fighter_id =  link.slice(36,)
                    }
                    else {
                        return false;
                    }
    
                
                        
                    //formulate the figher into an object
                 
                        for(let i =2; i<row_to_array_by_spaces.length; i+=3){
                            console.log(row_to_array_by_spaces[i])
                            if(row_to_array_by_spaces[i].trim().length == 0){
                                row_to_array_pruned.push("--")
                            }
                            else{
                                row_to_array_pruned.push(row_to_array_by_spaces[i]);
                            }
                        }
                        row_to_array_pruned = row_to_array_pruned.filter((str)=>{return /\S/.test(str)});
                        row_to_array_pruned = row_to_array_pruned.map((str)=>{ return str.trim()});
                      //  console.log(row_to_array_pruned)
                    
    
    
    
                    let fighter = {
                        first_name: row_to_array_pruned[0],
                        last_name: row_to_array_pruned[1],
                        nick_name: row_to_array_pruned[2],
                        height: row_to_array_pruned[3],
                        weight: row_to_array_pruned[4],
                        reach: row_to_array_pruned[5],
                        stance: row_to_array_pruned[6],
                        total_wins: row_to_array_pruned[7],
                        total_losses: row_to_array_pruned[8],
                        total_draws: row_to_array_pruned[9],
                        fighter_id: fighter_id,
                        link: link
    
                    }
                    console.log(fighter)
                    ufc_fighters.push(fighter);
                    console.log(ufc_fighters)
                   
                    return true
                })
    
            })
        }
       
    }
    console.log("after scraping")
    console.log(ufc_fighters)
    return ufc_fighters;
    
}


scrapeAllFighers().then((ufc_fighters)=>{
    


  

    const writeFightersToDB = async (fightersToWrite)=>{
     
        const { MongoClient } = require('mongodb');
        const uri = "mongodb+srv://admin:Pakistan11@cluster0.ks3d7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect(async (err) => {
            console.log("writing fighters of length: " + fightersToWrite.length)
            console.log("starting writing...")
          const fighters = client.db("MMAStats").collection("fighters");
          await fighters.insertMany(fightersToWrite, (err, result) => {
              if(err){
                console.log("error writing fighters to db: " +err); 
                return false;
              }
              else if(result){
                console.log("result of writing db: " + result); 
              }
              else{
                console.log("something unexpected happened writing fighters to db: " + err + result); 
              }
            
             
            
            });
          
          console.log("finished writing")
          client.close();
          return true;
          
        });

    }

    const writeFightersToDBDriver = async (ufc_fighters)=>{
        const fighters_to_write = [...ufc_fighters];
        console.log("writing fighters:");
        console.log(fighters_to_write)
    try{
        while(fighters_to_write.length>999){
            await writeFightersToDB(fighters_to_write.splice(0,998))
            .then((was_inserted)=>{
               if(!was_inserted){
                   console.log("unexpected error writing to DB, failed to insert. \n was_inserted value: " + was_inserted)
                   

                    return false;
                }
            });
        }
        if(fighters_to_write.length>0 && fighters_to_write.length<=999){
            await writeFightersToDB(fighters_to_write)
        }
        else{
            console.log("unexpected error writing to DB")
            console.log(fighters_to_write)
        }

    }
    catch(exception){
        console.log(exception)
    }

    }

    const writeFightersToFile = ()=>{
        fs.appendFileSync('fighters.txt', JSON.stringify(ufc_fighters),
        (err)=>{
           if (err) throw err;
           console.log('Saved!');
         });
    }

    writeFightersToDBDriver(ufc_fighters);

   
    
    
   
 
});





const writeFightersToDBTest = async ()=>{
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


    const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:<PASSWORD>@cluster0.ks3d7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
await client.connect(async (err) => {
  const fighters = client.db("MMAStats").collection("fighters");
  await fighters.insertMany(ufc_fighters, (err, result) => { console.log(err); });
  client.close();
});



}
