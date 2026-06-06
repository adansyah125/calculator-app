import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const buttons = [
  [
    { label: "C", value: "clear", variant: "destructive" },
    { label: "(", value: "(", variant: "secondary" },
    { label: ")", value: ")", variant: "secondary" },
    { label: "÷", value: "/", variant: "operator" },
  ],
  [
    { label: "7", value: "7", variant: "number" },
    { label: "8", value: "8", variant: "number" },
    { label: "9", value: "9", variant: "number" },
    { label: "×", value: "*", variant: "operator" },
  ],
  [
    { label: "4", value: "4", variant: "number" },
    { label: "5", value: "5", variant: "number" },
    { label: "6", value: "6", variant: "number" },
    { label: "−", value: "-", variant: "operator" },
  ],
  [
    { label: "1", value: "1", variant: "number" },
    { label: "2", value: "2", variant: "number" },
    { label: "3", value: "3", variant: "number" },
    { label: "+", value: "+", variant: "operator" },
  ],
  [
    { label: "±", value: "negate", variant: "secondary" },
    { label: "0", value: "0", variant: "number", span: 2 },
    { label: ".", value: ".", variant: "number" },
    { label: "=", value: "calculate", variant: "primary" },
  ],
];

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [formula, setFormula] = useState("");
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handleClick = useCallback(
    (value) => {
      if (value === "clear") {
        setDisplay("0");
        setFormula("");
        setJustEvaluated(false);
        return;
      }

      if (value === "negate") {
        if (display !== "0" && display !== "Error") {
          setDisplay((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
        }
        return;
      }

      if (display === "Error") {
        if (/^[0-9.]$/.test(value) || value === "(" || value === ")") {
          setDisplay("0");
          setFormula("");
          setJustEvaluated(false);
        } else {
          return;
        }
      }

      if (value === "calculate") {
        setJustEvaluated(true);
        try {
          const result = Function(
            '"use strict"; return (' + formula + display + ")",
          )();
          setFormula(formula + display + " =");
          setDisplay(String(result));
        } catch {
          setDisplay("Error");
        }
        return;
      }

      if (["/", "*", "-", "+", "%"].includes(value)) {
        setJustEvaluated(false);
        if (justEvaluated) {
          setFormula(display + " " + value + " ");
        } else {
          setFormula((prev) => prev + display + " " + value + " ");
        }
        setDisplay("0");
        return;
      }

      setJustEvaluated(false);
      setDisplay((prev) => {
        if (prev === "0" && value !== ".") return value;
        if (value === "." && prev.includes(".")) return prev;
        return prev + value;
      });
    },
    [display, formula, justEvaluated],
  );

  const handleKeyDown = useCallback(
    (e) => {
      const keyMap = {
        "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
        "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
        ".": ".", "+": "+", "-": "-", "*": "*", "/": "/",
        "%": "%", "(": "(", ")": ")",
        Enter: "calculate", "=": "calculate",
        Backspace: "clear",
        Escape: "clear",
        Delete: "clear",
      };
      const action = keyMap[e.key];
      if (action) {
        e.preventDefault();
        handleClick(action);
      }
    },
    [handleClick],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const variantStyles = {
    number:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60",
    operator:
      "bg-accent text-accent-foreground hover:bg-accent/80 active:bg-accent/60",
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm",
    destructive:
      "bg-destructive/15 text-destructive hover:bg-destructive/25 active:bg-destructive/35",
    secondary:
      "bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted/60",
  };

  const rows = buttons.map((row) => {
    const flat = [];
    let skipped = 0;
    for (let i = 0; i < row.length; i++) {
      if (skipped > 0) {
        skipped--;
        continue;
      }
      const btn = row[i];
      flat.push(btn);
      if (btn.span) skipped = btn.span - 1;
    }
    return flat;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-72 mx-auto bg-card text-card-foreground rounded-2xl border border-border shadow-2xl p-5 space-y-4"
    >
      <div className="space-y-0.5">
        <div className="text-right text-xs text-muted-foreground/70 h-4 overflow-x-auto whitespace-nowrap scrollbar-none tracking-wide">
          {formula || "\u00A0"}
        </div>
        <div className="text-right text-3xl font-semibold tracking-tight h-10 overflow-x-auto whitespace-nowrap scrollbar-none">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {rows.map((row, ri) =>
          row.map((btn, bi) => (
            <motion.button
              key={`${ri}-${bi}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={() => handleClick(btn.value)}
              className={`h-14 rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${btn.span === 2 ? "col-span-2" : ""} ${variantStyles[btn.variant] || variantStyles.number}`}
            >
              {btn.label}
            </motion.button>
          )),
        )}
      </div>
    </motion.div>
  );
}

export default Calculator;
