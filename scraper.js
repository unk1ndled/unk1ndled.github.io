const fs = require("fs");
const cheerio = require("cheerio");

// 1. Set up parameters (Pulled from GitHub Actions, with fallbacks)
const USERNAME = process.env.AOTY_USERNAME || "fantano";
const MIN_RATING = parseInt(process.env.MIN_RATING || "60", 10);
const MAX_ALBUMS = parseInt(process.env.MAX_ALBUMS || "10", 10);

// The URL for a user's ratings page
const targetUrl = `https://www.albumoftheyear.org/user/${USERNAME}/ratings/`;

async function scrapeUserRatings() {
  console.log(`Fetching AOTY ratings for user: ${USERNAME}...`);

  try {
    // 2. Fetch the HTML
    // We pass a real browser User-Agent so AOTY doesn't immediately block us as a bot
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Server responded with ${response.status}: ${response.statusText}`,
      );
    }

    const html = await response.text();

    // 3. Load the HTML into Cheerio
    const $ = cheerio.load(html);
    const parsedAlbums = [];

    // 4. Scrape the DOM
    // Note: You may need to inspect AOTY's HTML to confirm these exact class names.
    // They usually use generic rows for lists.
    $(".albumListRow").each((index, element) => {
      const title = $(element).find(".albumTitle").text().trim();
      const artist = $(element).find(".artistTitle").text().trim();
      const ratingText = $(element).find(".rating").text().trim();

      const rating = parseInt(ratingText, 10);

      // 5. Apply our logic: must have a title, valid number, and strictly > MIN_RATING
      if (title && !isNaN(rating) && rating > MIN_RATING) {
        parsedAlbums.push({ artist, title, rating });
      }
    });

    // 6. Slice to the requested amount (e.g., top 10)
    const finalList = parsedAlbums.slice(0, MAX_ALBUMS);

    // 7. Save to our JSON file
    fs.writeFileSync("albums.json", JSON.stringify(finalList, null, 2));
    console.log(`Success! Wrote ${finalList.length} albums to albums.json.`);
  } catch (error) {
    console.error("Scraping failed:", error.message);
    process.exit(1); // Tell GitHub Actions that the script failed
  }
}

scrapeUserRatings();
