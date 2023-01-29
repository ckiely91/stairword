import { DateTime, Interval } from "luxon";
import dailyWords from "../wordlists/dailyWords.json";

export const getTodaysWords = (): [string, string, number] => {
  const interval = Interval.fromDateTimes(
    DateTime.fromISO("2023-01-26T19:00:00.000Z"),
    DateTime.now()
  );
  const numDays = Math.floor(interval.length("days"));
  const words = dailyWords[numDays % dailyWords.length];

  return [words[0], words[1], numDays + 1];
};

export const getOverlapCountBetweenWords = (wordA: string, wordB: string) => {
  for (let i = 1; i < wordA.length; i++) {
    const sliced = wordA.slice(i);
    if (wordB.startsWith(sliced)) {
      return sliced.length;
    }
  }

  return 0;
};

export const getOverlapScore = (words: string[]) => {
  let score = 0;

  for (let i = 1; i < words.length; i++) {
    score += getOverlapCountBetweenWords(words[i - 1], words[i]);
  }

  return score;
};
