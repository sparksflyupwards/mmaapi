const rp = require('request-promise');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs');
const { resolve } = require('path');


ufc_events = [];

async function scrapeEvents(){

for(let i = 1; i<21; i++){

  const url = 'http://www.ufcstats.com/statistics/events/completed?page='+i;


await rp(url)
.then(function(html){
  //success!
  $ = cheerio.load(html);

  count = 0;
  table_body = $('body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr > td > i > a').each(function(i,elem) {
 
      event_row = $(this).text();
      var link = $(elem).attr('href');
      count +=1;
     // console.log(link)
      /** 
      //lets clean the data
      //remove extra spaces
  
      event_row = event_row.replace(/\s\s+/g, ' ');
      //lets put it into an array now;
      event_row_array = event_row.split(' ');
      */
      ufc_events.push(link)

  })
  console.log(url.slice(url.length-8))
  console.log(ufc_events.length)
  resolve(ufc_events)
  
})
.catch(function(err){
  //handle error
});
}

}


/**
 * fs.appendFileSync('events2.txt', ufc_events, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
 */
scrapeEvents().then(()=>{
  let count = 0;
  for(let event of ufc_events){
    event = ""+ event+ "\n";
    fs.appendFileSync('events2.txt', event, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }


  console.log("wrote: " + count)
  
});
