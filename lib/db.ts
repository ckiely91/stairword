import clientPromise, { dbName, gameResultsCollectionName } from "./mongodb";
import crypto from "crypto";

interface GameResult {
  words: string[];
  score: number;
  gameNumber: number;
  shortID: string;
}

const getGameResultCollection = async () => {
  const db = (await clientPromise).db(dbName);
  const gameResultsCol = db.collection<GameResult>(gameResultsCollectionName);
  return gameResultsCol;
};

export const saveGameResult = async (result: GameResult) => {
  const gameResultsCol = await getGameResultCollection();

  await gameResultsCol.insertOne(result);
};

export const getGameResultByShortID = async (shortID: string) => {
  const gameResultsCol = await getGameResultCollection();

  return await gameResultsCol.findOne({
    shortID: {
      $eq: shortID,
    },
  });
};

export const getStatsForStairwordNumber = async (stairwordNumber: number) => {
  const gameResultsCol = await getGameResultCollection();

  const cursor = gameResultsCol.aggregate<{
    maxScore: number;
    avgScore: number;
  }>([
    {
      $match: {
        gameNumber: stairwordNumber,
      },
    },
    {
      $group: {
        _id: null,
        maxScore: {
          $max: "$score",
        },
        avgScore: {
          $avg: "$score",
        },
      },
    },
  ]);

  const result = await cursor.toArray();

  if (result.length === 0) {
    return {
      maxScore: -1,
      avgScore: -1,
    };
  }

  return {
    maxScore: result[0].maxScore,
    avgScore: Math.round(result[0].avgScore),
  };
};

export const randomString = (len: number) => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let randomstring = "";
  for (let i = 0; i < len; i++) {
    const rnum = crypto.randomInt(chars.length);
    randomstring += chars[rnum];
  }

  return randomstring;
};
