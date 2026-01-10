import { useState, useEffect, useRef } from "react";

const ROLES = [
  "Solution Architect",
  "Web Engineer",
  "Avid Programmer",
  "Full Stack Developer",
];

const CHAR_FLIP_DELAY = 50; // ms between each character flip
const ROLE_DISPLAY_DURATION = 3000; // ms to display each role
const FIXED_WIDTH = 30; // Fixed character width to prevent layout shift

interface LetterProps {
  char: string;
  isFlipping: boolean;
}

function Letter({ char, isFlipping }: LetterProps) {
  return (
    <span className="letter-flip inline-block">
      <span
        className={`letter-flip-inner inline-block ${
          isFlipping ? "flipping" : ""
        }`}
      >
        <span className="letter-face text-accent">
          {char === " " ? "\u00A0" : char}
        </span>
      </span>
    </span>
  );
}

export default function RoleAnimator() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(ROLES[0].padEnd(FIXED_WIDTH, " "));
  const [flippingIndices, setFlippingIndices] = useState<Set<number>>(
    new Set()
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cycleRole = () => {
      const nextRoleIndex = (currentRoleIndex + 1) % ROLES.length;
      const nextRole = ROLES[nextRoleIndex];

      // Animate each character with staggered delay (all FIXED_WIDTH characters)
      for (let i = 0; i < FIXED_WIDTH; i++) {
        setTimeout(() => {
          setFlippingIndices((prev) => new Set(prev).add(i));

          // After flip animation, update the character
          setTimeout(() => {
            setDisplayedText((prev) => {
              const chars = prev.split("");
              chars[i] = nextRole[i] || " ";
              return chars.join("");
            });
            setFlippingIndices((prev) => {
              const next = new Set(prev);
              next.delete(i);
              return next;
            });
          }, 200); // Half of the flip animation duration
        }, i * CHAR_FLIP_DELAY);
      }

      // Set next role index after all animations complete
      setTimeout(() => {
        setCurrentRoleIndex(nextRoleIndex);
      }, FIXED_WIDTH * CHAR_FLIP_DELAY + 400);
    };

    timeoutRef.current = setTimeout(cycleRole, ROLE_DISPLAY_DURATION);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentRoleIndex]);

  return (
    <span className="inline-flex" aria-label={ROLES[currentRoleIndex]}>
      {displayedText.split("").map((char, index) => (
        <Letter
          key={index}
          char={char}
          isFlipping={flippingIndices.has(index)}
        />
      ))}
    </span>
  );
}
