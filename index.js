const jsdom = require("jsdom");
const fetch = require("node-fetch");
const util = require("util");
const fs = require("fs");
const moment = require("moment");

const streamPipeline = util.promisify(require("stream").pipeline);

const { program } = require("commander");

const { JSDOM } = jsdom;

program
  .requiredOption("-u, --user <username>", "mixlr username")
  .requiredOption("-o, --output <directory>", "output directory");

program.parse(process.argv);

const options = program.opts();

async function download(url, destination) {
  if (fs.existsSync(destination)) {
    console.log(`Already downloaded ${destination}`);
    return;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unexpected response ${response.statusText}`);
  }

  await streamPipeline(response.body, fs.createWriteStream(destination));
}

(async () => {
  const allBroadcasts = [];

  let page = 1;

  while (true) {
    const response = await fetch(
      `https://mixlr.com/${options.user}/showreel?page=${page}`
    );
    const html = await response.text();

    const {
      window: { broadcasts = [] },
    } = new JSDOM(html, { runScripts: "dangerously" });

    if (!broadcasts.length) {
      break;
    }

    console.log(`Fetched Page ${page}`);

    allBroadcasts.push(...broadcasts);
    ++page;
  }

  for (const broadcast of allBroadcasts) {
    const {
      title,
      started_at: date,
      slug,
      streams: {
        http: { url },
      },
    } = broadcast;
    const momentDate = moment(date);
    const outputPath = `${options.output}/${momentDate.format(
      "YYYYMMDD"
    )}-${slug}.mp3`;
    console.log(`Downloading ${outputPath}`);
    await download(url, outputPath);
  }
})();
