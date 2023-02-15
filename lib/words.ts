import { DateTime, Interval } from "luxon";
import dailyWords from "../wordlists/dailyWords.json";
import wordList from "../wordlists/allWords.json";

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
    let wordScore = getOverlapCountBetweenWords(words[i - 1], words[i]);

    // First and last word overlaps get double points
    if (i === 1 || i === words.length - 1) {
      wordScore *= 2;
    }

    score += wordScore;
  }

  return score;
};

export const checkWordValid = async (word: string) => {
  // First check if it's in our short word list
  const wordLower = word.toLowerCase();
  if (wordList.includes(wordLower)) {
    return true;
  }

  // Next consult the dictionary API
  try {
    const resp = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${wordLower}`
    );
    if (!resp.ok) {
      console.log("non-ok response from dictionary API: ", resp.status);
      return false;
    }

    const json = await resp.json();

    if (Array.isArray(json) && json.length > 0) {
      return true;
    }

    return false;
  } catch (e) {
    console.error("error fetching word validity: ", e);
  }

  return false;
};
