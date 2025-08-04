const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const ROBLOSECURITY = process.env.ROBLOSECURITY;

app.get("/gamepasses", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const response = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?limit=10`, {
      headers: { Cookie: `.ROBLOSECURITY=${ROBLOSECURITY}` }
    });

    const games = response.data.data;
    let passes = [];

    for (let game of games) {
      const gameId = game.id;
      const gpRes = await axios.get(`https://www.roblox.com/game-pass-api/game-passes?startRow=0&maxRows=100&sortOrder=Asc&gameId=${gameId}`, {
        headers: { Cookie: `.ROBLOSECURITY=${ROBLOSECURITY}` }
      });

      if (Array.isArray(gpRes.data)) {
        for (let pass of gpRes.data) {
          passes.push({
            id: pass.ProductId,
            name: pass.Name,
            price: pass.PriceInRobux,
            assetId: pass.AssetId
          });
        }
      }
    }

    res.json(passes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch passes" });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
