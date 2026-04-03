const namespace = "unk1ndled";
const key = "unk1ndled.github.io";

const apiUrl = `https://api.counterapi.dev/v1/${namespace}/${key}/up`;

function getOrdinal(n) {
  if (n === -1 || typeof n !== "number") return "---";

  const remainder10 = n % 10;
  const remainder100 = n % 100;

  // special teens
  if (remainder100 === 11 || remainder100 === 12 || remainder100 === 13) {
    return n + "th";
  }

  // standard 1 2 3 rules
  if (remainder10 === 1) return n + "st";
  if (remainder10 === 2) return n + "nd";
  if (remainder10 === 3) return n + "rd";

  // Default
  return n + "th";
}

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    const count = data.count ?? -1;
    document.getElementById("view-count").innerText = getOrdinal(count);
  })
  .catch((error) => {
    console.error("Error fetching visit count:", error);
    document.getElementById("view-count").innerText = "error";
  });
