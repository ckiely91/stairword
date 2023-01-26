import StairWordDisplay, {
  getOverlapCountBetweenWords,
  getOverlapScore,
} from "@/components/StairWordDisplay";
import { NextPage, GetStaticProps } from "next";
import { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft, faPlay } from "@fortawesome/free-solid-svg-icons";

interface IHomeProps {
  startWord: string;
  endWord: string;
  totalWords: number;
}

const Home: NextPage<IHomeProps> = ({ startWord, endWord, totalWords }) => {
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

  const trySubmitWord = useCallback(() => {
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

    const isLastWord = currentWordIndex === totalWords - 2;
    if (isLastWord) {
      const nextWord = words[currentWordIndex + 1];
      const overlap = getOverlapCountBetweenWords(inputVal, nextWord);
      if (overlap === 0) {
        alert(`Your new word must overlap with the start of "${nextWord}".`);
        return;
      }
    }

    if (words.indexOf(inputVal) > -1) {
      alert("Words must all be unique.");
      return;
    }

    const newWords = [...words];
    newWords[currentWordIndex] = inputVal;
    setWords(newWords);
    setCurrentWordIndex(currentWordIndex + 1);
    setInputVal("");

    if (isLastWord) {
      setIsEditing(false);
    }
  }, [words, currentWordIndex, inputVal]);

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
            onChange={(e) => setInputVal(e.target.value.trim().toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && trySubmitWord()}
          />
          <div
            className="cursor-pointer px-2 bg-red-900 flex items-center"
            onClick={undo}
          >
            <FontAwesomeIcon icon={faRotateLeft} className="h-5" />
          </div>
          <div
            className="cursor-pointer px-4 bg-blue-900 flex items-center rounded-tr-lg rounded-br-lg"
            onClick={trySubmitWord}
          >
            <FontAwesomeIcon icon={faPlay} className="h-5" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col mt-3 p-2">
          <div className="">
            You did it! Your score: {getOverlapScore(words)}
          </div>
          {/* <div className="p-2 mt-2 bg-blue-900">Share</div> */}
        </div>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps<IHomeProps> = async (context) => {
  return {
    props: {
      startWord: "ACCESS",
      endWord: "FACTOR",
      totalWords: 5,
    },
    revalidate: 3600, // Regenerate site every hour
  };
};

export default Home;
