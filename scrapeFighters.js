const rp = require('request-promise');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs');
const { resolve } = require('path');


ufc_fighters = [];

async function scrapeEvents(){



  const url = 'http://www.ufcstats.com/statistics/fighters?char=a&page=all'


await rp(url)
.then(function(html){
  //success!
  $ = cheerio.load(html);

  count = 0;
  table_body = $('body > section > div > div > div > table > tbody > tr:nth-child(3)').each(function(i,elem) {


     // We have fighter data from figher page and the link for more fighter data
     // TODO: format figher data and link properly to be inserted into DB
      let fighter_data = $(elem).text().split("\n").filter((str)=>{return /\S/.test(str)});
      fighter_data = fighter_data.map((data_string)=>data_string.trim());

      let link = $(elem).children().children().attr('href');
      console.log("fighter data: "+fighter_data);
      console.log("link: "+link)


      count +=1;

      ufc_fighters.push(link)

  })
  resolve(ufc_fighters)
  
})
.catch(function(err){
  //handle error
});
}





scrapeEvents().then(()=>{
  let count = 0;
  for(let fighter of ufc_fighters){
  

    //TODO: append fighter into DB
    fs.appendFileSync('events2.txt', event, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }


  console.log("wrote: " + count)
  
});
