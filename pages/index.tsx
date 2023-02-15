import StairWordDisplay from "@/components/StairWordDisplay";
import { NextPage, GetStaticProps } from "next";
import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft, faPlay } from "@fortawesome/free-solid-svg-icons";

import {
  checkWordValid,
  getOverlapCountBetweenWords,
  getOverlapScore,
  getTodaysWords,
} from "@/lib/words";
import { getTodaysData, setTodaysData } from "@/lib/storage";
import { ResultData } from "./api/result";
import { getStatsForStairwordNumber } from "@/lib/db";

const siteURL = "https://stairword.acrofever.com";

interface IHomeProps {
  startWord: string;
  endWord: string;
  totalWords: number;
  stairwordNumber: number;
  todaysMaxScore: number;
  todaysAvgScore: number;
}

const Home: NextPage<IHomeProps> = ({
  startWord,
  endWord,
  totalWords,
  stairwordNumber,
  todaysMaxScore,
  todaysAvgScore,
}) => {
  const [words, setWords] = useState(() => {
    const words: string[] = [startWord];
    for (let i = 0; i < totalWords - 2; i++) {
      words.push("");
    }
    words.push(endWord);
    return words;
  });

  const [currentWordIndex, setCurrentWordIndex] = useState(1);
  const [inputVal, setInputVal] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [uniqueShareID, setUniqueShareID] = useState("");
  const [todaysStats, setTodaysStats] = useState({
    todaysMaxScore,
    todaysAvgScore,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedData = getTodaysData();
    if (
      storedData?.stairwordNumber === stairwordNumber &&
      storedData.words[0] === startWord
    ) {
      setWords(storedData.words);
      const nextBlankIdx = storedData.words.indexOf("");
      setCurrentWordIndex(nextBlankIdx);

      if (nextBlankIdx === -1) {
        setIsEditing(false);
      }

      if (storedData.shareID) {
        setUniqueShareID(storedData.shareID);
      }
    }
  }, [startWord, stairwordNumber]);

  const trySubmitWord = useCallback(async () => {
    if (inputVal.length < 3) {
      alert("Words must be at least 3 letters long.");
      return;
    }

    const prevWord = words[currentWordIndex - 1];
    const overlap = getOverlapCountBetweenWords(prevWord, inputVal);

    if (overlap === 0) {
      alert(`Your new word must overlap with the end of "${prevWord}".`);
      return;
    }

    if (overlap === inputVal.length) {
      alert(`Your new word must extend past the previous word.`);
      return;
    }

    const isLastWord = currentWordIndex === totalWords - 2;
    if (isLastWord) {
      const nextWord = words[currentWordIndex + 1];
      const overlap = getOverlapCountBetweenWords(inputVal, nextWord);
      if (overlap === 0) {
        alert(`Your new word must overlap with the start of "${nextWord}".`);
        return;
      }

      if (overlap === nextWord.length) {
        alert("The final word must extend past the previous word.");
        return;
      }
    }

    if (words.indexOf(inputVal) > -1) {
      alert("Words must all be unique.");
      return;
    }

    setIsSubmitting(true);

    // Check if this is in the dictionary
    const wordLower = inputVal.toLowerCase();
    const isWord = await checkWordValid(wordLower);
    if (!isWord) {
      alert("Word not in dictionary.");
      setIsSubmitting(false);
      return;
    }

    const newWords = [...words];
    newWords[currentWordIndex] = inputVal;

    if (isLastWord) {
      try {
        const resp = await fetch(`/api/result?words=${newWords.join(",")}`, {
          method: "POST",
        });
        const result: ResultData = await resp.json();

        setIsEditing(false);

        if (result.uniqueShareID !== undefined) {
          setUniqueShareID(result.uniqueShareID);
          setTodaysData({
            words: newWords,
            stairwordNumber,
            shareID: result.uniqueShareID,
          });
        }

        if (
          result.todaysAvgScore !== undefined &&
          result.todaysMaxScore !== undefined
        ) {
          setTodaysStats({
            todaysAvgScore: result.todaysAvgScore,
            todaysMaxScore: result.todaysMaxScore,
          });
        }
      } catch (e) {
        console.error("error submitting", e);
        alert("Sorry, something went wrong submitting your answer.");
        setIsSubmitting(false);
        return;
      }
    } else {
      setTodaysData({
        words: newWords,
        stairwordNumber,
      });
    }

    setWords(newWords);
    setCurrentWordIndex(currentWordIndex + 1);
    setInputVal("");
    setIsSubmitting(false);
  }, [words, currentWordIndex, inputVal, totalWords, stairwordNumber]);

  const undo = useCallback(() => {
    if (currentWordIndex < 2) {
      return;
    }

    if (!confirm("Do you want to undo your last word?")) {
      return;
    }

    const newWords = [...words];
    newWords[currentWordIndex - 1] = "";
    setWords(newWords);
    setCurrentWordIndex(currentWordIndex - 1);
    setInputVal("");
  }, [words, currentWordIndex]);

  const share = useCallback(() => {
    const shareText = `Stairword #${stairwordNumber}

${startWord} ➡️ ${endWord}
Score: ${getOverlapScore(words)}

Play it yourself: ${siteURL}

See my solution (spoilers!): ${siteURL}/${uniqueShareID}`;

    if (typeof navigator.share === "function") {
      navigator.share({
        text: shareText,
      });
    } else if (typeof navigator.clipboard === "object") {
      navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard.");
    }
  }, [stairwordNumber, startWord, endWord, words, uniqueShareID]);

  return (
    <>
      <StairWordDisplay
        words={words}
        highlightRow={isEditing ? currentWordIndex : -1}
      />
      {isEditing ? (
        <div className="flex flex-row items-stretch justify-stretch mt-3 px-1">
          <input
            type="text"
            className="grow bg-slate-800 rounded-tl-lg rounded-bl-lg p-2 font-mono"
            placeholder="Type word here"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value.trim().toLowerCase())}
            onKeyDown={(e) => e.key === "Enter" && trySubmitWord()}
          />
          <div
            className={`px-2 bg-red-900 flex items-center ${
              isSubmitting ? "opacity-25" : "cursor-pointer"
            }`}
            onClick={isSubmitting ? undefined : undo}
          >
            <FontAwesomeIcon icon={faRotateLeft} className="h-5" />
          </div>
          <div
            className={`px-4 bg-blue-900 flex items-center rounded-tr-lg rounded-br-lg ${
              isSubmitting ? "opacity-25" : "cursor-pointer"
            }`}
            onClick={isSubmitting ? undefined : trySubmitWord}
          >
            <FontAwesomeIcon icon={faPlay} className="h-5" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col mt-3 p-2">
          <div className="">
            You did it! Your score: {getOverlapScore(words)}
          </div>
          {todaysStats.todaysAvgScore > -1 &&
            todaysStats.todaysMaxScore > -1 && (
              <div className="mt-2">
                Today&apos;s max score: {todaysStats.todaysMaxScore}
                <br />
                Today&apos;s average score: {todaysStats.todaysAvgScore}
              </div>
            )}
          {uniqueShareID && (
            <div
              className="p-2 mt-2 bg-blue-900 cursor-pointer"
              onClick={share}
            >
              Share
            </div>
          )}
        </div>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps<IHomeProps> = async (context) => {
  const [startWord, endWord, stairwordNumber] = getTodaysWords();
  const todaysStats = await getStatsForStairwordNumber(stairwordNumber);

  return {
    props: {
      startWord: startWord.toLowerCase(),
      endWord: endWord.toLowerCase(),
      totalWords: 5,
      stairwordNumber,
      todaysAvgScore: todaysStats.avgScore,
      todaysMaxScore: todaysStats.maxScore,
    },
    revalidate: 3600, // Regenerate site every hour
  };
};

export default Home;
