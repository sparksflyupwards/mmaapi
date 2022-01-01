const axios = require('axios');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')
const lineReader = require('line-reader');
const { resolve } = require('path');




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
                    
                    //console.log(fighter)
                    return
                })
    
            })
        }
       
    }
    
}

scrapeAllFighers();