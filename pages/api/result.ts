import {
  getStatsForStairwordNumber,
  randomString,
  saveGameResult,
} from "@/lib/db";
import {
  checkWordValid,
  getOverlapCountBetweenWords,
  getTodaysWords,
} from "@/lib/words";
import type { NextApiRequest, NextApiResponse } from "next";
import wordList from "../../wordlists/allWords.json";

export interface ResultData {
  uniqueShareID?: string;
  todaysMaxScore?: number;
  todaysAvgScore?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResultData>
) {
  if (req.method !== "POST") {
    res.status(404).json({
      error: "not found",
    });
    return;
  }

  const wordsStr = req.query["words"];
  if (typeof wordsStr !== "string") {
    res.status(422).json({
      error: "invalid payload",
    });
    return;
  }

  const words = wordsStr.split(",");

  if (words.length !== 5) {
    res.status(422).json({
      error: "5 words required",
    });
    return;
  }

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].toLowerCase();
  }

  // now validate the words
  const [startWord, endWord, stairwordNumber] = getTodaysWords();
  if (words[0] !== startWord || words[words.length - 1] !== endWord) {
    res.status(422).json({
      error: "words do not match today's words",
    });
    return;
  }

  // ensure we have overlaps and calculate the score
  let score = 0;
  for (let i = 1; i < words.length; i++) {
    const overlapCount = getOverlapCountBetweenWords(words[i - 1], words[i]);
    if (overlapCount === 0) {
      res.status(422).json({
        error: "words do not overlap",
      });
      return;
    }
    score += overlapCount;
  }

  // ensure they are in the dictionary
  for (let i = 0; i < words.length; i++) {
    const isWord = await checkWordValid(words[i]);

    if (!isWord) {
      res.status(422).json({
        error: `${words[i]} is not a word`,
      });
      return;
    }
  }

  // All good, we can now save
  const shortID = randomString(5);
  try {
    await saveGameResult({
      words,
      score,
      gameNumber: stairwordNumber,
      shortID,
    });
  } catch (e) {
    console.error("error saving game result", e);
    res.status(500).json({
      error: "internal server error",
    });
    return;
  }

  console.log("successfully saved game result");

  let stats;
  try {
    stats = await getStatsForStairwordNumber(stairwordNumber);
  } catch (e) {
    console.error("error getting stats", e);
    res.status(500).json({
      error: "internal server error",
    });
    return;
  }

  res.status(200).json({
    uniqueShareID: shortID,
    todaysAvgScore: stats.avgScore,
    todaysMaxScore: stats.maxScore,
  });
}
