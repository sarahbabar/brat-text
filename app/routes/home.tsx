import { useState, useRef, useCallback, useEffect } from "react";
import type { Route } from "./+types/home";
import {
  TextAlignStart,
  TextAlignEnd,
  TextAlignCenter,
  TextAlignJustify,
} from "lucide-react";
import FittedTextArea from "~/components/FittedTextArea";
import { toPng } from "html-to-image";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "brat generator" },
    { name: "description", content: "generate unique brat album covers" },
  ];
}
const albums = [
  { name: "brat", album: "#8ace00", text: "#000000" },
  { name: "brat deluxe", album: "#ffffff", text: "#000000" },
  { name: "crash", album: "#079bda", text: "#fd0000" },
  { name: "how im feeling now", album: "#ffffff", text: "#bfbfbf" },
  { name: "charli", album: "#908985", text: "#000000" },
  { name: "pop2", album: "#c9a2dd", text: "#000000" },
  { name: "number 1 angel", album: "#d40001", text: "#fe0302" },
  { name: "sucker", album: "#f5abcd", text: "#ffffff" },
  { name: "true romance", album: "#700150", text: "#ffffff" },
  { name: "vroom vroom", album: "#000000", text: "#333333" },
] as const;

const alignments = [
  [TextAlignStart, "left"],
  [TextAlignEnd, "right"],
  [TextAlignCenter, "center"],
  [TextAlignJustify, "justify"],
] as const;

export default function Home() {
  const [theme, setTheme] = useState(0);
  const [alignment, setAlignment] =
    useState<(typeof alignments)[number][1]>("center");

  const imageRef = useRef<HTMLDivElement>(null);
  const currentAlbum = albums[theme];

  const saveImage = useCallback(async () => {
    if (imageRef.current === null) {
      return;
    }
    try {
      const dataUrl = await toPng(imageRef.current, {
        style: { transform: "scale(2)" },
      });
      const link = document.createElement("a");
      const date = new Date().toLocaleDateString().replaceAll("/", "-");
      link.download = `${currentAlbum.name}-${date}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("failed to save a:", error);
    }
  }, [imageRef]);

  const isTabletOrMobile = false; // useMediaQuery({ query: "(max-width: 1224px)" });
  const length = isTabletOrMobile ? 128 : 512;

  function stepAlignment(prev: typeof alignment, direction: 1 | -1) {
    const curIndex = alignments.findIndex(
      ([_, alignType]) => alignType === prev,
    );
    const nextIndex = (curIndex + direction + (direction === 1 ? 0 : 4)) % 4;
    return alignments[nextIndex][1];
  }

  const handleUserKeyPress = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    if (key === "ArrowRight") {
      setTheme((prev) => (prev + 1) % 10);
    } else if (key === "ArrowLeft") {
      setTheme((prev) => (prev - 1 + 10) % 10);
    } else if (key === "ArrowDown") {
      setAlignment((prev) => stepAlignment(prev, 1));
    } else if (key === "ArrowUp") {
      setAlignment((prev) => stepAlignment(prev, -1));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  return (
    <div
      className="flex flex-col items-center justify-start md:justify-center pt-6 md:pt-0 h-screen transition-colors duration-300"
      style={{ background: albums[theme].album + "80" }}
    >
      <div className="flex flex-col items-center justify-center scale-100 md:scale-[1.5] origin-top md:origin-center">
        <div className="flex items-center">
          <div className="grid grid-cols-1 gap-2 mt-2 *:size-8">
            {alignments.map(([Alignment, name], i) => (
              <button
                key={i}
                onClick={() => setAlignment(name)}
                className={`blur-[0.5px] flex justify-center items-center cursor-pointer transition-opacity duration-200
                          ${alignment === name ? "opacity-100" : "opacity-40 "}
                `}
              >
                <Alignment
                  size={20}
                  strokeWidth={3}
                  style={{ color: currentAlbum.text }}
                />
              </button>
            ))}
          </div>
          <div className="w-[256px] h-[256px] flex items-center justify-center shadow-xl mx-7 my-8">
            <div
              className="scale-50 p-8"
              ref={imageRef}
              style={{ background: currentAlbum.album }}
            >
              <FittedTextArea
                textAlign={alignment}
                verticalAlign="center"
                maxFont={200}
                width={length}
                height={length}
                autoFocus
                placeholder={currentAlbum.name}
                style={{
                  filter: "blur(2px)",
                  color: currentAlbum.text,
                  transform: "scaleY(1.1)",
                }}
                className="aspect-square focus:outline-none caret-transparent resize-none"
              ></FittedTextArea>
            </div>
          </div>
        </div>

        <div className="flex w-full justify-between mt-3">
          {albums.map((album, index) => (
            <button
              key={index}
              className={`size-5 text-2xl flex justify-center items-center cursor-pointer blur-[0.5px] transition duration-200
                ${theme === index ? "scale-140" : "scale-100"}
              `}
              style={{ background: album.album, color: album.text }}
              onClick={() => setTheme(index)}
            ></button>
          ))}
        </div>
        <div className="text-lg">
          <div className="mt-4 mb-2">
            <button
              onClick={() => {
                saveImage();
              }}
              className="text-lg tracking-widest opacity-70 hover:opacity-100 transition blur-[0.5px]"
              style={{ color: currentAlbum.text }}
            >
              save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
