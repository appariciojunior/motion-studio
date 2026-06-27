import { TREATMENT_GROUPS, type TreatmentGroup, type Treatment } from "./types";
import { gradientMapTreatment } from "./gradient-map";
import { organicDistortionTreatment } from "./organic-distortion";
import { particleGridTreatment } from "./particle-grid";
import { ditherWavesTreatment } from "./dither-waves";
import { risoPrintTreatment } from "./riso-print";
import { rippleTreatment } from "./ripple";
import { grainScanlinesTreatment } from "./grain-scanlines";
import { gradientGeneratorTreatment } from "./gradient-generator";
import { chartsTreatment } from "./charts";

export const treatments: Treatment[] = [
  // Image effects
  gradientMapTreatment,
  organicDistortionTreatment,
  particleGridTreatment,
  ditherWavesTreatment,
  risoPrintTreatment,
  rippleTreatment,
  grainScanlinesTreatment,
  // Generators
  gradientGeneratorTreatment,
  chartsTreatment,
];

export function getTreatment(id: string): Treatment | undefined {
  return treatments.find((t) => t.id === id);
}

/** Treatments grouped by group, in TREATMENT_GROUPS order. Empty groups omitted. */
export function treatmentsByGroup(): { group: TreatmentGroup; treatments: Treatment[] }[] {
  return TREATMENT_GROUPS.map((group) => ({
    group,
    treatments: treatments.filter((t) => t.group === group),
  })).filter((g) => g.treatments.length > 0);
}
