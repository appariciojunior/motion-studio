import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
  TabsRoot,
  Tabs,
  TabsTrigger,
} from "@glaze/core/components";
import { Copy, Check, Download, WrapText } from "lucide-react";
import type { Effect, EffectParams } from "./effects/types";
import { copyToClipboard, downloadText } from "../lib/export-utils";

interface ExportDialogProps {
  effect: Effect;
  params: EffectParams;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Format = "react" | "js" | "json" | "css";

const FORMAT_META: Record<Format, { label: string; ext: string; mime: string }> = {
  react: { label: "React + Motion", ext: "tsx", mime: "text/plain" },
  js: { label: "JavaScript", ext: "js", mime: "text/javascript" },
  json: { label: "JSON", ext: "json", mime: "application/json" },
  css: { label: "CSS", ext: "css", mime: "text/css" },
};

export function ExportDialog({ effect, params, open, onOpenChange }: ExportDialogProps) {
  const hasJs = typeof effect.exports.js === "function";
  const hasCss = typeof effect.exports.css === "function";
  const [format, setFormat] = React.useState<Format>("react");
  const [copied, setCopied] = React.useState(false);
  const [wrapText, setWrapText] = React.useState(false);

  // Fall back to React when switching to an effect that lacks the active format.
  React.useEffect(() => {
    if (format === "css" && !hasCss) setFormat("react");
    if (format === "js" && !hasJs) setFormat("react");
  }, [format, hasCss, hasJs]);

  const content = React.useMemo(() => {
    if (format === "json") {
      return JSON.stringify({ effect: effect.id, name: effect.name, params }, null, 2);
    }
    if (format === "js" && effect.exports.js) {
      return effect.exports.js(params);
    }
    if (format === "css" && effect.exports.css) {
      return effect.exports.css(params);
    }
    return effect.exports.react(params);
  }, [effect, params, format]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    const meta = FORMAT_META[format];
    downloadText(`${effect.id}.${meta.ext}`, content, meta.mime);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Export {effect.name}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <TabsRoot value={format} onValueChange={(v) => setFormat(v as Format)}>
            <Tabs variant="filled" size="small">
              <TabsTrigger value="react">{FORMAT_META.react.label}</TabsTrigger>
              {hasJs && <TabsTrigger value="js">{FORMAT_META.js.label}</TabsTrigger>}
              <TabsTrigger value="json">{FORMAT_META.json.label}</TabsTrigger>
              {hasCss && <TabsTrigger value="css">{FORMAT_META.css.label}</TabsTrigger>}
            </Tabs>
          </TabsRoot>
          <div className="relative mt-3">
            <Button
              variant="default"
              size="small"
              iconOnly
              className="absolute top-2 right-2 z-10 backdrop-blur-sm"
              aria-label={wrapText ? "Disable text wrapping" : "Wrap text"}
              aria-pressed={wrapText}
              title={wrapText ? "Disable text wrapping" : "Wrap text"}
              onClick={() => setWrapText((current) => !current)}
            >
              <WrapText size={14} />
            </Button>
            <pre
              className={`h-[46vh] overflow-auto rounded-md bg-control border border-separator p-4 pr-12 font-mono text-small leading-relaxed ${
                wrapText ? "whitespace-pre-wrap break-words" : "whitespace-pre"
              }`}
            >
              <code>{content}</code>
            </pre>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="default" onClick={handleDownload}>
            <Download size={15} />
            Download .{FORMAT_META[format].ext}
          </Button>
          <Button variant="accent" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
