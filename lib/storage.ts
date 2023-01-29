export interface TodaysData {
  stairwordNumber: number;
  words: string[];
  shareID?: string;
}

const todaysDataLocalStorageKey = "stairword";

export const setTodaysData = (data: TodaysData) => {
  localStorage.setItem(todaysDataLocalStorageKey, JSON.stringify(data));
};

export const getTodaysData = (): TodaysData | undefined => {
  const json = localStorage.getItem(todaysDataLocalStorageKey);
  if (json) {
    return JSON.parse(json) as TodaysData;
  }

  return undefined;
};
