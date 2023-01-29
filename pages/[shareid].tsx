import StairWordDisplay from "@/components/StairWordDisplay";
import { getGameResultByShortID, getStatsForStairwordNumber } from "@/lib/db";
import { getTodaysWords } from "@/lib/words";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";

interface ISharedResultProps {
  words: string[];
  stairwordNumber: number;
  score: number;
  maxScore: number;
  avgScore: number;
}

const SharedResult: NextPage<ISharedResultProps> = ({
  words,
  stairwordNumber,
  score,
  maxScore,
  avgScore,
}) => {
  return (
    <>
      <StairWordDisplay words={words} highlightRow={-1} />
      <div className="flex flex-col mt-3 p-2">
        <div className="">
          Stairword #{stairwordNumber}
          <br />
          Their score: {score}
        </div>
        <div className="mt-2">
          Max score: {maxScore}
          <br />
          Average score: {avgScore}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<ISharedResultProps> = async (
  context
) => {
  const shareID = context.params?.shareid;
  if (typeof shareID !== "string") {
    throw new Error("invalid path");
  }

  const gameResults = await getGameResultByShortID(shareID);
  if (!gameResults) {
    throw new Error("not found");
  }

  const stats = await getStatsForStairwordNumber(gameResults.gameNumber);

  const [, , stairwordNumber] = getTodaysWords();

  let revalidate: number | boolean = 3600; // regenerate data every hour
  if (stairwordNumber !== gameResults.gameNumber) {
    // If the day has passed when this result was submitted, the stats will never need to update.
    // No need to revalidate.
    revalidate = false;
  }

  for (let i = 0; i < gameResults.words.length; i++) {
    gameResults.words[i] = gameResults.words[i].toUpperCase();
  }

  return {
    props: {
      words: gameResults.words,
      stairwordNumber: gameResults.gameNumber,
      score: gameResults.score,
      maxScore: stats.maxScore,
      avgScore: stats.avgScore,
    },
    revalidate,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SharedResult;
