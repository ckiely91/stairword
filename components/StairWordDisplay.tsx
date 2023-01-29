import { getOverlapCountBetweenWords } from "@/lib/words";
import { FC, useMemo } from "react";

interface IStairWordDisplayProps {
  words: string[];
  highlightRow?: number;
}

const StairWordDisplay: FC<IStairWordDisplayProps> = ({
  words,
  highlightRow,
}) => {
  const renderItems = useMemo(() => {
    let totalLength = 0;
    let hasBlanks = false;

    return words.map((word, i) => {
      if (word === "") {
        hasBlanks = true;
      }

      const prevWordOverlapCount =
        i > 0 ? getOverlapCountBetweenWords(words[i - 1], word) : 0;
      const nextWordOverlapCount =
        i < words.length - 1
          ? getOverlapCountBetweenWords(word, words[i + 1])
          : 0;

      let prevOverlap, bothOverlap, nonOverlap, nextOverlap;

      if (prevWordOverlapCount + nextWordOverlapCount > word.length) {
        prevOverlap = word.slice(0, word.length - nextWordOverlapCount);
        bothOverlap = word.slice(
          word.length - nextWordOverlapCount,
          prevWordOverlapCount
        );
        nonOverlap = "";
        nextOverlap = word.slice(prevWordOverlapCount);
      } else {
        prevOverlap = word.slice(0, prevWordOverlapCount);
        bothOverlap = "";
        nonOverlap = word.slice(
          prevWordOverlapCount,
          word.length - nextWordOverlapCount
        );
        nextOverlap = word.slice(word.length - nextWordOverlapCount);
      }

      const indent = totalLength - prevWordOverlapCount;

      totalLength += word.length - prevWordOverlapCount;

      return {
        indent,
        prevOverlap,
        nonOverlap,
        nextOverlap,
        bothOverlap,
        rightAlign: hasBlanks && i === words.length - 1,
      };
    });
  }, [words]);

  return (
    <div className="font-mono text-2xl overflow-x-auto ">
      <div className="py-2 min-w-full inline-flex flex-col divide-y divide-dotted divide-slate-700">
        {renderItems.map((item, i) => (
          <div
            key={i}
            className={`py-1 px-5 ${item.rightAlign ? "text-right" : ""} ${
              highlightRow === i ? "bg-slate-800" : ""
            }`}
          >
            {!item.rightAlign && (
              <span className="whitespace-pre">{" ".repeat(item.indent)}</span>
            )}
            <span className="text-orange-400 whitespace-pre">
              {item.prevOverlap}
            </span>
            <span className="text-orange-400 whitespace-pre">
              {item.bothOverlap}
            </span>
            <span className="whitespace-pre">{item.nonOverlap}</span>
            <span className=" whitespace-pre">{item.nextOverlap}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StairWordDisplay;
