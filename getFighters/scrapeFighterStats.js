const axios = require("axios");
const cheerio = require("cheerio");
const { table } = require("console");
const fs = require("fs");
const lineReader = require("line-reader");
const { resolve } = require("path");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
dotenv.config();

const scrapeFighterStats = async (fighter) => {
  const url = "http://ufcstats.com/fighter-details/" + fighter.fighter_id;
  console.log(url);
  await axios.get(url).then((response) => {
    $ = cheerio.load(response.data);
    //parses through each table cell if there are cells on this page else ends scraping of the letter
    const table_row_selector =
      "body > section > div > div > div.b-list__info-box.b-list__info-box_style_middle-width.js-guide.clearfix > div.b-list__info-box-left.clearfix";

    //if selector returns empty array of elements finish scraping and return error
    if ($(table_row_selector).length <= 0) {
      console.log(
        "failed to load fighter data for fighter: " + fighter.fighter_id
      );
      return -1;
    }

    table_body = $(table_row_selector).each((i, elem) => {
      //format the elements data into an array slicing out the spaces
      table_row = $(elem).text();
      const row_to_array_by_spaces = table_row.split("\n");
      //start pruning by removing every empty element
      let row_to_array_pruned = row_to_array_by_spaces.filter((str) =>
        str.trim().length == 0 ? false : true
      );
      //finally try remaining elements
      row_to_array_pruned = row_to_array_pruned.map((str) => str.trim());

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

      const fighter_stats = {};
      for (let i = 1; i < row_to_array_pruned.length - 1; i += 2) {
        fighter_stats[row_to_array_pruned[i]] = row_to_array_pruned[i + 1];
      }

      //formulate the figher into an object
      fighter.stats = fighter_stats;

      console.log(fighter);
      return fighter;
    });
  });
};

const fighters = [
  {
    _id: {
      $oid: "61d4c06555366272048398c1",
    },
    first_name: "Nate",
    last_name: "Diaz",
    nick_name: "--",
    height: "6' 0\"",
    weight: "170 lbs.",
    reach: '76.0"',
    stance: "Southpaw",
    total_wins: "21",
    total_losses: "13",
    total_draws: "0",
    fighter_id: "8355922d564b152c",
  },
  {
    _id: {
      $oid: "61d4c0655536627204839206",
    },
    first_name: "Conor",
    last_name: "McGregor",
    nick_name: "The Notorious",
    height: "5' 9\"",
    weight: "155 lbs.",
    reach: '74.0"',
    stance: "Southpaw",
    total_wins: "22",
    total_losses: "6",
    total_draws: "0",
    fighter_id: "f4c49976c75c5ab2",
  },
];

(async () => {
  for (fighter of fighters) {
    await scrapeFighterStats(fighter);
  }
})();
