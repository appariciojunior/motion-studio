import * as React from "react";
import { SplitView } from "@glaze/core/components";
import { effects } from "../components/effects/registry";
import { treatments } from "../components/treatments/registry";
import { defaultParams, type EffectParams, type ParamValue } from "../components/effects/types";
import { resolveItem, defaultItemId, libraryGroups } from "../lib/library";
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
  const handleAnimChange = (patch: Partial<AnimationSettings>) => {
    setAnim((prev) => ({ ...prev, ...patch }));
    setReplayToken((token) => token + 1);
  };

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
  const libraryItems = React.useMemo(() => libraryGroups().flatMap((group) => group.items), []);
  const activeIndex = libraryItems.findIndex((entry) => entry.id === activeId);
  const previousItem = libraryItems[(activeIndex - 1 + libraryItems.length) % libraryItems.length];
  const nextItem = libraryItems[(activeIndex + 1) % libraryItems.length];
  const params = paramsMap[activeId];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setReplayToken(0);
  };

  const handleNavigate = (id: string) => {
    handleSelect(id);
  };

  React.useEffect(() => {
    if (exportOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      if (
        target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="slider"], [role="spinbutton"]',
        )
      ) {
        return;
      }

      event.preventDefault();
      handleNavigate(event.key === "ArrowLeft" ? previousItem.id : nextItem.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exportOpen, previousItem.id, nextItem.id]);

  const handleChange = (id: string, value: ParamValue) => {
    setParamsMap((prev) => ({
      ...prev,
      [activeId]: { ...prev[activeId], [id]: value },
    }));
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
            />
          ) : (
            <TreatmentPanel
              treatment={item.treatment}
              params={params}
              onChange={handleChange}
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
            previousLabel={previousItem.name}
            nextLabel={nextItem.name}
            onPrevious={() => handleNavigate(previousItem.id)}
            onNext={() => handleNavigate(nextItem.id)}
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
            previousLabel={previousItem.name}
            nextLabel={nextItem.name}
            onPrevious={() => handleNavigate(previousItem.id)}
            onNext={() => handleNavigate(nextItem.id)}
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
