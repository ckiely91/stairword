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
