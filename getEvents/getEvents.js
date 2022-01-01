const rp = require('request-promise');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs');
const { resolve } = require('path');


ufc_events = [];

async function scrapeEvents(){
//TODO: find total number of events programatically
for(let i = 1; i<24; i++){

  const url = 'http://www.ufcstats.com/statistics/events/completed?page='+i;


await rp(url)
.then((html)=>{

  $ = cheerio.load(html);

  count = 0;
  table_body = $('body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr > td > i > a').each(function(i,elem) {

    //get the event row UI element then the href within the element
      event_row = $(this).text();
      var link = $(elem).attr('href');
      count +=1;
      ufc_events.push(link)

  })
  console.log(url.slice(url.length-8))
  console.log(ufc_events.length)
  resolve(JSON.stringify(ufc_events))
  
})
.catch((err)=>{
  console.log(err)
});
}

}

//once we have all the links lets persist them
scrapeEvents().then(()=>{
  let count = 0;
  for(let event of ufc_events){
    event = ""+ event+ "\n";
    fs.appendFileSync('events2.txt', event,
     (err)=>{
        if (err) throw err;
        console.log('Saved!');
      });
  }


  console.log("wrote: " + count)
  
});
