import StairWordDisplay from "@/components/StairWordDisplay";
import { NextPage } from "next";

const HowToPlay: NextPage = () => {
  return (
    <>
      <h1 className="text-2xl font-semibold mt-4 mb-1">How to Play</h1>
      <p className="my-1">
        Each day, you&apos;ll be given a <strong>start</strong> and an{" "}
        <strong>end</strong> word.
        <br />
        You must find a sequence of 3 words to connect them.
      </p>
      <p className="my-1">Each word in your sequence must:</p>
      <ul className="my-1 list-disc list-inside">
        <li>Overlap the end of the previous word by at least one letter.</li>
        <li>Extend the previous word by at least one letter.</li>
      </ul>
      <p className="my-1">
        Here&apos;s an example of a completed <em>Stairword</em>:
      </p>
      <StairWordDisplay
        words={["zinger", "gerbil", "billy", "lysine", "nestle"]}
      />
      <h1 className="text-2xl font-semibold mt-4 mb-1">Scoring</h1>
      <p className="my-1">
        You score a point for every overlapping letter, shown in{" "}
        <span className="text-orange-400">orange</span>.
        <br />
        You score <strong>double points</strong> for every letter overlapping
        the start or end words, shown in{" "}
        <span className="text-lime-400">green</span>.
      </p>
      <p className="my-1">
        The above example would score <strong>15 points</strong>.
      </p>
    </>
  );
};

export default HowToPlay;
