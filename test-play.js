const play = require('play-dl');

async function test() {
  try {
    console.log("Fetching video info...");
    const url = "https://www.youtube.com/watch?v=bM7SZ5SBzyY"; // Alan Walker - Fade
    const info = await play.video_info(url);
    console.log("Title:", info.video_details.title);
    console.log("Author:", info.video_details.channel.name);
    console.log("Thumbnail:", info.video_details.thumbnails[info.video_details.thumbnails.length - 1].url);
    
    console.log("Fetching stream...");
    const stream = await play.stream_from_info(info);
    console.log("Stream type:", stream.type);
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
