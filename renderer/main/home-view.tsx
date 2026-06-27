import * as React from "react";
import { SplitView } from "@glaze/core/components";
import { effects } from "../components/effects/registry";
import { treatments } from "../components/treatments/registry";
import { defaultParams, type EffectParams, type ParamValue } from "../components/effects/types";
import { resolveItem, defaultItemId } from "../lib/library";
import { EffectSidebar } from "../components/effect-sidebar";
import { ControlPanel } from "../components/control-panel";
import { PreviewStage } from "../components/preview-stage";
import { ExportDialog } from "../components/export-dialog";
import { TreatmentPanel } from "../components/treatment-panel";
import { TreatmentStage } from "../components/treatment-stage";
import { SAMPLE_IMAGES, loadSample, loadFile, type SampleImage } from "../lib/source-image";
import { defaultAnimation, type AnimationSettings } from "../lib/anim";

function buildInitialParams(): Record<string, EffectParams> {
  const map: Record<string, EffectParams> = {};
  for (const effect of effects) map[effect.id] = defaultParams(effect.controls);
  for (const treatment of treatments) map[treatment.id] = defaultParams(treatment.controls);
  return map;
}

export function HomeView() {
  const [selectedId, setSelectedId] = React.useState(defaultItemId);
  const [paramsMap, setParamsMap] = React.useState<Record<string, EffectParams>>(buildInitialParams);
  const [replayToken, setReplayToken] = React.useState(0);
  const [exportOpen, setExportOpen] = React.useState(false);

  // Shared source image for the treatment lab.
  const [sourceId, setSourceId] = React.useState(SAMPLE_IMAGES[0].id);
  const [source, setSource] = React.useState<HTMLImageElement | null>(null);

  // Shared easing-driven animation settings for image treatments.
  const [anim, setAnim] = React.useState<AnimationSettings>(defaultAnimation);
  const handleAnimChange = (patch: Partial<AnimationSettings>) =>
    setAnim((prev) => ({ ...prev, ...patch }));

  React.useEffect(() => {
    let alive = true;
    loadSample(SAMPLE_IMAGES[0]).then((img) => {
      if (alive) setSource(img);
    });
    return () => {
      alive = false;
    };
  }, []);

  const item = resolveItem(selectedId) ?? { kind: "effect" as const, effect: effects[0] };
  const activeId = item.kind === "effect" ? item.effect.id : item.treatment.id;
  const controls = item.kind === "effect" ? item.effect.controls : item.treatment.controls;
  const params = paramsMap[activeId];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setReplayToken(0);
  };

  const handleChange = (id: string, value: ParamValue) => {
    setParamsMap((prev) => ({
      ...prev,
      [activeId]: { ...prev[activeId], [id]: value },
    }));
  };

  const handleReset = () => {
    setParamsMap((prev) => ({ ...prev, [activeId]: defaultParams(controls) }));
  };

  const handlePickSample = (sample: SampleImage) => {
    setSourceId(sample.id);
    loadSample(sample).then(setSource);
  };

  const handlePickFile = (file: File) => {
    loadFile(file)
      .then((img) => {
        setSource(img);
        setSourceId("custom");
      })
      .catch(() => {
        /* ignore unreadable images */
      });
  };

  return (
    <>
      <SplitView
        storageKey="motion-studio"
        className="h-full"
        sidebar={<EffectSidebar selectedId={selectedId} onSelect={handleSelect} />}
        sidebarSize={{ default: 220, min: 180, max: 300 }}
        inspector={
          item.kind === "effect" ? (
            <ControlPanel
              effect={item.effect}
              params={params}
              onChange={handleChange}
              onReset={handleReset}
            />
          ) : (
            <TreatmentPanel
              treatment={item.treatment}
              params={params}
              onChange={handleChange}
              onReset={handleReset}
              sourceId={sourceId}
              onPickSample={handlePickSample}
              onPickFile={handlePickFile}
              anim={anim}
              onAnimChange={handleAnimChange}
            />
          )
        }
        inspectorSize={{ default: 300, min: 260, max: 380 }}
      >
        {item.kind === "effect" ? (
          <PreviewStage
            effect={item.effect}
            params={params}
            replayToken={replayToken}
            onReplay={() => setReplayToken((t) => t + 1)}
            onExport={() => setExportOpen(true)}
          />
        ) : (
          <TreatmentStage
            treatment={item.treatment}
            params={params}
            source={source}
            anim={anim}
            replayToken={replayToken}
            onReplay={() => setReplayToken((t) => t + 1)}
            onDropFile={handlePickFile}
          />
        )}
      </SplitView>
      {item.kind === "effect" && (
        <ExportDialog
          effect={item.effect}
          params={params}
          open={exportOpen}
          onOpenChange={setExportOpen}
        />
      )}
    </>
  );
}
