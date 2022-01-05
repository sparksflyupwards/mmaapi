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

    //add the DOB
    const fighter_details_selector =
      "body > section > div > div > div.b-list__info-box.b-list__info-box_style_small-width.js-guide > ul";
    $(fighter_details_selector).each((i, elem) => {
      //format the elements data into an array slicing out the spaces
      table_row = $(elem).text();
      const row_to_array_by_spaces = table_row.split("\n");
      //start pruning by removing every empty element
      let row_to_array_pruned = row_to_array_by_spaces.filter((str) =>
        str.trim().length == 0 ? false : true
      );
      //finally try remaining elements
      row_to_array_pruned = row_to_array_pruned.map((str) => str.trim());
      //console.log(row_to_array_pruned)

      //store the DOB.
      const date = row_to_array_pruned[row_to_array_pruned.length - 1];
      fighter.date_of_birth = date;
    });

    //add the stat object to fighter
    const career_stats_selector =
      "body > section > div > div > div.b-list__info-box.b-list__info-box_style_middle-width.js-guide.clearfix > div.b-list__info-box-left.clearfix";

    //if selector returns empty array of elements finish scraping and return error
    if ($(career_stats_selector).length <= 0) {
      console.log(
        "failed to load fighter data for fighter: " + fighter.fighter_id
      );
      return -1;
    }

    $(career_stats_selector).each((i, elem) => {
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

      //if stats values are zero'd out then indicate that this stat object is incomplete
      let incomplete = true;
      let stat_values = Object.values(fighter_stats);
      for (let stat of stat_values) {
        //if entry doesnt start with a zero its a valid entry and we can keep the stats object
        if (stat.slice(0, 2) != "0." && stat.slice(0, 2) != "0%") {
          incomplete = false;
        }
      }
      fighter_stats.incomplete = incomplete;

      //formulate the figher into an object
      fighter.stats = fighter_stats;
    });

    //add all fight_id's
    const fight_history_selector =
      "body > section > div > div > table > tbody > tr";
    const fight_history = [];
    $(fight_history_selector).each((i, elem) => {
      const fight_link = $(elem).attr("data-link");
      if (fight_link) {
        fight_history.push(fight_link.slice(fight_link.length - 16));
      }
    });

    fighter.fight_history_ids = fight_history;

    console.log(fighter);
    return fighter;
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
  {
    _id: {
      $oid: "61d4c06555366272048391fb",
    },
    first_name: "Scott",
    last_name: "McDonald",
    nick_name: "--",
    height: "--",
    weight: "--",
    reach: "--",
    stance: "--",
    total_wins: "1",
    total_losses: "0",
    total_draws: "0",
    fighter_id: "08ae3100bf2100ed",
  },
  {
    _id: {
      $oid: "61d4c06555366272048391fd",
    },
    first_name: "Josh",
    last_name: "McDonald",
    nick_name: "--",
    height: "--",
    weight: "185 lbs.",
    reach: "--",
    stance: "--",
    total_wins: "9",
    total_losses: "5",
    total_draws: "0",
    fighter_id: "b507a76087e3ed9f",
  },
  {
    _id: {
      $oid: "61d4c0655536627204839205",
    },
    first_name: "Jack",
    last_name: "McGlaughlin",
    nick_name: "--",
    height: "--",
    weight: "--",
    reach: "--",
    stance: "Orthodox",
    total_wins: "1",
    total_losses: "4",
    total_draws: "0",
    fighter_id: "237187ed9f419285",
  },
];

(async () => {
  for (fighter of fighters) {
    await scrapeFighterStats(fighter);
  }
})();
