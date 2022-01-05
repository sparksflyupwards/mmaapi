const axios = require("axios");
const cheerio = require("cheerio");
const { table } = require("console");
const fs = require("fs");
const lineReader = require("line-reader");
const { resolve } = require("path");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
dotenv.config();


const scrapeFighterStats = async (fighter)=>{
    const url = "http://ufcstats.com/fighter-details/" + fighter.fighter_id;
    console.log(url)
    await axios.get(url)
    .then((response)=>{
    
        $ = cheerio.load(response.data);
        //parses through each table cell if there are cells on this page else ends scraping of the letter
        const table_row_selector = 'body > section > div > div > div.b-list__info-box.b-list__info-box_style_middle-width.js-guide.clearfix > div.b-list__info-box-left.clearfix';

        if($(table_row_selector).length <= 1){
        }

        table_body =  $(table_row_selector).each((i, elem) => {
           //format the elements data into an array slicing out the spaces
            //format the elements data into an array slicing out the spaces
          table_row = $(elem).text();
          const row_to_array_by_spaces = table_row.split("\n");
          //start pruning by removing every empty element
          let row_to_array_pruned = row_to_array_by_spaces.filter((str)=>
              str.trim().length == 0 ? false : true);
          //finally try remaining elements
          row_to_array_pruned = row_to_array_pruned.map((str)=>str.trim())

        console.log("row with spaces")
        /**
         * example row_to_be_pruned should look like
         * [
                'Career statistics:', 'SLpM:',
                '4.51',               'Str. Acc.:',
                '45%',                'SApM:',
                '3.73',               'Str. Def:',
                '52%',                'TD Avg.:',
                '1.10',               'TD Acc.:',
                '30%',                'TD Def.:',
                '41%',                'Sub. Avg.:',
                '1.3'
            ]
         */
        console.log(row_to_array_by_spaces)
         
          
        console.log(row_to_array_pruned)

        const fighter_stats = {};
        for(let i=1; i<row_to_array_pruned.length-1; i+=2){
            fighter_stats[row_to_array_pruned[i]] = row_to_array_pruned[i+1];
        }

        console.log(fighter_stats)
        

        
          

          //formulate the figher into an object
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
            fighter_id: fighter.fighter_id,
          };

           // console.log(fighter);
        })
    })


}


const fighter = {
    "_id": {
        "$oid": "61d4c06555366272048398c1"
    },
    "first_name": "Nate",
    "last_name": "Diaz",
    "nick_name": "--",
    "height": "6' 0\"",
    "weight": "170 lbs.",
    "reach": "76.0\"",
    "stance": "Southpaw",
    "total_wins": "21",
    "total_losses": "13",
    "total_draws": "0",
    "fighter_id": "8355922d564b152c"
}


scrapeFighterStats(fighter);