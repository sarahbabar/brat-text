import { useState, useRef, useLayoutEffect, type CSSProperties } from "react";

export interface FittedTextAreaProps {
  /** initial text value */
  defaultValue?: string;
  /** controlled text value */
  value?: string;
  /** called when the text changes */
  onChange?: (value: string) => void;
  /** called with the computed font size after fitting */
  onFit?: (fontSize: number) => void;
  /** width of the preview box in px */
  width?: number;
  /** height of the preview box in px */
  height?: number;
  /** minimum font size in px */
  minFont?: number;
  /** maximum font size in px */
  maxFont?: number;
  /** text alignment */
  textAlign?: "left" | "center" | "right" | "justify";
  /** font weight */
  fontWeight?: number;
  /** font style */
  fontStyle?: CSSProperties["fontStyle"];
  /** text transform */
  textTransform?: CSSProperties["textTransform"];
  /** word break */
  wordBreak?: CSSProperties["wordBreak"];
  /** line height */
  lineHeight?: number;
  /** vertical alignment of text within the box */
  verticalAlign?: "top" | "center" | "bottom";
  /** additional style merged onto the outer container */
  style?: CSSProperties;
  /** class name for the textarea */
  className?: string;
  /** placeholder text */
  placeholder?: string;
  /** autofocus */
  autoFocus?: boolean;
}

// largest font size where the textarea content doesn't overflow its fixed height
function fitToTextarea(
  ta: HTMLTextAreaElement,
  min: number,
  max: number,
  containerH: number,
): number {
  let lo = min;
  let hi = max;

  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    ta.style.fontSize = `${mid}px`;
    if (ta.scrollHeight <= containerH) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const result = Math.floor(lo);
  ta.style.fontSize = `${result}px`;
  return result;
}

export default function FittedTextArea({
  defaultValue = "",
  value,
  onChange,
  onFit,
  width = 500,
  height = 400,
  minFont = 1,
  maxFont = 400,
  textAlign = "center",
  fontWeight = 400,
  fontStyle = "normal",
  textTransform = "none",
  wordBreak = "normal",
  lineHeight = 1.1,
  verticalAlign = "top",
  style,
  className,
  placeholder = "Type here…",
  autoFocus = false,
}: FittedTextAreaProps) {
  const [internal, setInternal] = useState(defaultValue);
  const text = value ?? internal;
  const taRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastFit = useRef<number>(maxFont);

  const handleChange = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  useLayoutEffect(() => {
    const ta = taRef.current;
    const wrapper = wrapperRef.current;
    if (!ta || !wrapper) return;

    // Reset textarea to full height for clean font-size measurement
    ta.style.height = `${height}px`;
    ta.style.paddingTop = "0px";

    const fs = fitToTextarea(ta, minFont, maxFont, height);
    if (fs !== lastFit.current) {
      lastFit.current = fs;
      onFit?.(fs);
    }

    // Now measure actual content height by temporarily setting height to 0
    // and reading scrollHeight
    ta.style.height = "0px";
    const contentH = ta.scrollHeight;

    // Set textarea to content height so flexbox can position it
    ta.style.height = `${Math.min(contentH, height)}px`;
  });

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        width,
        height,
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent:
          verticalAlign === "center"
            ? "center"
            : verticalAlign === "bottom"
              ? "flex-end"
              : "flex-start",
        ...style,
      }}
    >
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoFocus={autoFocus}
        style={{
          display: "block",
          width: "100%",
          textAlign,
          textAlignLast: textAlign === "justify" ? "justify" : undefined,
          fontWeight,
          fontStyle,
          textTransform,
          wordBreak,
          lineHeight,
          fontFamily: "inherit",
          border: "none",
          outline: "none",
          resize: "none",
          overflow: "hidden",
          background: "transparent",
          color: "inherit",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
