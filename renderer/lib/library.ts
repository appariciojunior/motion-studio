import type { ReactNode } from "react";
import type { Effect } from "../components/effects/types";
import { effects, effectsByCategory } from "../components/effects/registry";
import type { Treatment } from "../components/treatments/types";
import { treatments, treatmentsByGroup } from "../components/treatments/registry";

// Unifies the two libraries — motion effects and image treatments — behind one
// sidebar + selection model. Each library keeps its own registry/preview/export
// path; this layer only merges them for navigation.

export type LibraryItem =
  | { kind: "effect"; effect: Effect }
  | { kind: "treatment"; treatment: Treatment };

export interface LibraryGroup {
  title: string;
  items: { id: string; name: string; icon: ReactNode }[];
}

export function libraryGroups(): LibraryGroup[] {
  const motion: LibraryGroup[] = effectsByCategory().map((g) => ({
    title: g.category,
    items: g.effects.map((e) => ({ id: e.id, name: e.name, icon: e.icon })),
  }));
  const treat: LibraryGroup[] = treatmentsByGroup().map((g) => ({
    title: g.group,
    items: g.treatments.map((t) => ({ id: t.id, name: t.name, icon: t.icon })),
  }));
  return [...motion, ...treat];
}

export function resolveItem(id: string): LibraryItem | undefined {
  const effect = effects.find((e) => e.id === id);
  if (effect) return { kind: "effect", effect };
  const treatment = treatments.find((t) => t.id === id);
  if (treatment) return { kind: "treatment", treatment };
  return undefined;
}

/** First item in the library (used as the default selection). */
export const defaultItemId = effects[0].id;
