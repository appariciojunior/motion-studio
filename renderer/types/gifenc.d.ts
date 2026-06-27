// Minimal type declarations for gifenc (the package ships no types).
// Covers only the API surface used by lib/video-export.ts.
declare module "gifenc" {
  type Pixels = Uint8Array | Uint8ClampedArray | number[];
  type Palette = number[][];

  export interface GifEncoderInstance {
    writeFrame(
      index: Pixels,
      width: number,
      height: number,
      opts?: { palette?: Palette; delay?: number; transparent?: boolean; dispose?: number },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  }

  export function GIFEncoder(opts?: { auto?: boolean; initialCapacity?: number }): GifEncoderInstance;

  export function quantize(
    rgba: Pixels,
    maxColors: number,
    opts?: { format?: "rgb565" | "rgb444" | "rgba4444"; oneBitAlpha?: boolean | number; clearAlpha?: boolean },
  ): Palette;

  export function applyPalette(
    rgba: Pixels,
    palette: Palette,
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;
}
