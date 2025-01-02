import { useEffect, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import "./App.css";

/*
const fromCH = (c: number, h: number) => `lch(58.1 ${c} ${h})`;

const colors = [fromCH(40.7, 255.6), fromCH(67, 114.1), fromCH(70.9, 4.8)];
*/
const colors = ["#1b94d0", "#799600", "#e43074"];

const points = colors
  .flatMap((color) => [
    { value: 1, color },
    { value: 2, color },
    { value: 3, color },
  ])
  .sort(() => Math.random() - 0.5);

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
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    console.log(challenge);
    for (const button of document.getElementsByClassName("answer")) {
      button.classList.remove("checked");
    }
  }, [challenge]);

  return (
    <>
      <p className="challenge">
        👆 Clique si
        <br />
        {challenge.globalNot && <>pas&nbsp;( </>}
        {challenge.colorNot && <>pas&nbsp;( </>}
        {challenge.color && (
          <code
            style={{
              backgroundColor: challenge.color,
            }}
            className="color"
          >
            {challenge.color}
          </code>
        )}
        {challenge.colorNot && <>&nbsp;)</>}
        {challenge.operand && <> {challenge.operand} </>}
        {challenge.numberNot && <>pas&nbsp;( </>}
        {challenge.number && challenge.number}
        {challenge.numberNot && <>&nbsp;)</>}
        {challenge.globalNot && <>&nbsp;)</>}
      </p>
      <div ref={animationParent} className="buttons">
        {points.map((point) => (
          <button
            key={point.value + point.color}
            type="button"
            style={{
              backgroundColor: point.color,
            }}
            className={`button answer ${match(point, challenge) ? "right" : "wrong"}`}
            onClick={(event) => {
              (event.target as HTMLButtonElement).classList.add("checked");

              let allRightAnswersChecked = true;

              for (const button of document.querySelectorAll(".answer.right")) {
                allRightAnswersChecked =
                  allRightAnswersChecked &&
                  button.classList.contains("checked");
              }

              setIsFinished(allRightAnswersChecked);
            }}
            disabled={isFinished}
          >
            {point.value}
          </button>
        ))}
        {isFinished ? (
          <button
            type="button"
            style={{
              backgroundColor: "hsl(0 67% 9%)",
              color: "white",
              gridColumn: "2 / 3",
            }}
            className="button"
            onClick={() => {
              let perfect = true;

              for (const button of document.querySelectorAll(".answer.wrong")) {
                perfect = perfect && !button.classList.contains("checked");
              }

              points.sort(() => Math.random() - 0.5);

              let newLevel = level;

              if (perfect) {
                newLevel = Math.min(levelPatterns.length - 1, level + 1);
              }

              setLevel(newLevel);
              setChallenge(makeChallenge(levelPatterns[newLevel]));
              setIsFinished(false);
            }}
          >
            👆
          </button>
        ) : (
          <button
            type="button"
            style={{
              backgroundColor: "hsl(0 67% 9%)",
              color: "white",
              gridColumn: "2 / 3",
            }}
            className="button"
            onClick={() => {
              for (const button of document.getElementsByClassName("answer")) {
                button.classList.add("checked");

                setIsFinished(true);
              }
            }}
          >
            ?!
          </button>
        )}
      </div>
      <footer>
        Inspiré de <a href="https://booleangame.com/">Boolean Game</a>
      </footer>
    </>
  );
}

export default App;
