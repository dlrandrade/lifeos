import { ImageResponse } from "next/og.js";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "icons");

await mkdir(outDir, { recursive: true });

function MaskRect({ size, padding = 0 }) {
  const inner = size - padding * 2;
  return {
    type: "div",
    props: {
      style: {
        width: `${size}px`,
        height: `${size}px`,
        background:
          "radial-gradient(circle at 30% 20%, #1f1f1f 0%, #0a0a0a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      children: {
        type: "div",
        props: {
          style: {
            width: `${inner}px`,
            height: `${inner}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f8f3eb",
            fontFamily: "serif",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            fontSize: `${Math.round(inner * 0.55)}px`,
            lineHeight: 1,
          },
          children: "lst",
        },
      },
    },
  };
}

function FlatRect({ size, bg = "#161616", inset = 0 }) {
  return {
    type: "div",
    props: {
      style: {
        width: `${size}px`,
        height: `${size}px`,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      children: {
        type: "div",
        props: {
          style: {
            width: `${size - inset * 2}px`,
            height: `${size - inset * 2}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f8f3eb",
            fontFamily: "serif",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            fontSize: `${Math.round((size - inset * 2) * 0.45)}px`,
            lineHeight: 1,
          },
          children: "lst",
        },
      },
    },
  };
}

async function renderTo(filePath, element, size) {
  const response = new ImageResponse(element, { width: size, height: size });
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(filePath, buffer);
  console.log(
    `wrote ${filePath.replace(resolve(here, ".."), "")} (${buffer.length} bytes)`,
  );
}

await renderTo(resolve(outDir, "icon-192.png"), MaskRect({ size: 192 }), 192);
await renderTo(resolve(outDir, "icon-512.png"), MaskRect({ size: 512 }), 512);
await renderTo(
  resolve(outDir, "icon-maskable-512.png"),
  FlatRect({ size: 512, inset: 96 }),
  512,
);
await renderTo(
  resolve(outDir, "apple-touch-icon.png"),
  MaskRect({ size: 180 }),
  180,
);

console.log("done.");
