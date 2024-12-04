import { useEffect, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import "./App.css";

const fromHue = (h: number) => `hsl(${h} 67% 49%)`;

const colors = [fromHue(63), fromHue(303), fromHue(183)];

const points = colors.flatMap((color) => [
  { value: 1, color },
  { value: 2, color },
  { value: 3, color },
]);

const levelPatterns = ["C", "N", "CoN", "!CoN", "Co!N", "!Co!N", "!!Co!N"];

const makeChallenge = (pattern: string) => {
  return {
    globalNot: pattern.match(/!!/) && Math.random() < 0.5,
    colorNot: pattern.match(/!C/) && Math.random() < 0.5,
    color:
      pattern.match(/C/) && colors[Math.floor(Math.random() * colors.length)],
    operand: pattern.match(/o/) && ["et", "ou"][Math.floor(Math.random() * 2)],
    numberNot: pattern.match(/!N/) && Math.random() < 0.5,
    number: pattern.match(/N/) && Math.ceil(Math.random() * 3),
  };
};

const match = (
  point: (typeof points)[0],
  challenge: ReturnType<typeof makeChallenge>,
) => {
  const colorMatch =
    challenge.color == null ||
    (challenge.colorNot
      ? challenge.color !== point.color
      : challenge.color === point.color);

  const numberMatch =
    challenge.number == null ||
    (challenge.numberNot
      ? challenge.number !== point.value
      : challenge.number === point.value);

  const globalMatch =
    challenge.operand == null
      ? challenge.color
        ? colorMatch
        : numberMatch
      : challenge.operand === "et"
        ? colorMatch && numberMatch
        : colorMatch || numberMatch;

  return challenge.globalNot ? !globalMatch : globalMatch;
};

function App() {
  const [animationParent] = useAutoAnimate();

  const [level, setLevel] = useState(0);
  const [challenge, setChallenge] = useState(
    makeChallenge(levelPatterns[level]),
  );

  useEffect(() => {
    console.log(challenge);
    for (const button of document.getElementsByClassName("button")) {
      button.classList.remove("valid", "invalid");
    }
  }, [challenge]);

  return (
    <>
      <p className="challenge">
        {challenge.globalNot && (
          <>
            <span>pas</span>(
          </>
        )}
        {challenge.colorNot && <span>pas</span>}
        {challenge.color && (
          <span
            style={{
              display: "inline-block",
              width: 0,
              height: "2rem",
              overflow: "hidden",
              paddingLeft: "2rem",
              backgroundColor: challenge.color,
              borderRadius: "50%",
            }}
          >
            {challenge.color}
          </span>
        )}
        {challenge.operand}
        {challenge.numberNot && <span>pas</span>}
        {challenge.number && <span>{challenge.number}</span>}
        {challenge.globalNot && ")"}
      </p>
      <div
        ref={animationParent}
        style={{
          display: "inline-grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem",
        }}
      >
        {points
          .sort(() => Math.random() - 0.5)
          .map((point) => (
            <button
              key={point.value + point.color}
              type="button"
              style={{
                backgroundColor: point.color,
              }}
              className="button"
              onClick={(event) => {
                if (match(point, challenge)) {
                  (event.target as HTMLButtonElement).classList.add("valid");
                } else {
                  (event.target as HTMLButtonElement).classList.add("invalid");
                }
              }}
            >
              {point.value}
            </button>
          ))}
        <button
          type="button"
          style={{
            backgroundColor: "hsl(0 67% 9%)",
            gridColumn: "1 / -1",
            justifySelf: "center",
          }}
          className="button"
          onClick={() => {
            setLevel((level + 1) % 7);
            setChallenge(makeChallenge(levelPatterns[(level + 1) % 7]));
          }}
        >
          &#8634;
        </button>
      </div>
    </>
  );
}

export default App;
