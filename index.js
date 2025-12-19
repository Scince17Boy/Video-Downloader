import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/api/resolve", async (req, res) => {
  try {
    const { url, kind } = req.body;
    if (!url || !kind) {
      return res.json({ ok: false, message: "Missing url or kind" });
    }

    const searchRes = await fetch(
      `https://okatsu-rolezapiiz.vercel.app/search/youtube?query=${encodeURIComponent(url)}`
    );
    const searchData = await searchRes.json();

    if (!searchData?.result?.length) {
      return res.json({ ok: false, message: "No video found" });
    }

    const video = searchData.result[0];
    let dlApi = "";

    if (kind === "audio") {
      dlApi = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(video.url)}`;
    } else {
      dlApi = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(video.url)}`;
    }

    const dlRes = await fetch(dlApi);
    const dlData = await dlRes.json();

    if (!dlData?.result?.download) {
      return res.json({ ok: false, message: "Download failed" });
    }

    res.json({
      ok: true,
      title: video.title,
      thumbnail: video.thumbnail,
      durationSec: null,
      source: video.url,
      downloadUrl: dlData.result.download
    });

  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
