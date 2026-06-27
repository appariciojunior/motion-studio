import { CATEGORIES, type Category, type Effect } from "./types";
import { shimmerEffect } from "./shimmer";
import { skeletonEffect } from "./skeleton";
import { spinnerEffect } from "./spinner";
import { progressBarEffect } from "./progress-bar";
import { dotsLoaderEffect } from "./dots-loader";
import { pulsePingEffect } from "./pulse-ping";
import { progressRingEffect } from "./progress-ring";
import { confettiEffect } from "./confetti";
import { overlaysEffect } from "./overlays";
import { modalsEffect } from "./modals";
import { toastEffect } from "./toast";
import { drawerEffect } from "./drawer";
import { popoverEffect } from "./popover";
import { tooltipEffect } from "./tooltip";
import { pageTransitionsEffect } from "./page-transitions";
import { staggerListEffect } from "./stagger-list";
import { hoverCardEffect } from "./hover-card";
import { counterEffect } from "./counter";
import { textShimmerEffect } from "./text-shimmer";
import { textScrambleEffect } from "./text-scramble";
import { typewriterEffect } from "./typewriter";
import { wavyTextEffect } from "./wavy-text";
import { gradientTextEffect } from "./gradient-text";
import { auroraEffect } from "./aurora";
import { meshGradientEffect } from "./mesh-gradient";
import { dotGridEffect } from "./dot-grid";
import { floatingBlobsEffect } from "./floating-blobs";
import { tiltCardEffect } from "./tilt-card";
import { magneticButtonEffect } from "./magnetic-button";
import { likeBurstEffect } from "./like-burst";
import { barEqualizerEffect } from "./bar-equalizer";
import { rippleLoaderEffect } from "./ripple-loader";
import { buttonPressEffect } from "./button-press";
import { curtainsEffect } from "./curtains";
import { familyDialogEffect } from "./family-dialog";
import { modalSharedLayoutEffect } from "./modal-shared-layout";
import { accordionEffect } from "./accordion";
import { colorPickerEffect } from "./color-picker";
import { charactersRemainingEffect } from "./characters-remaining";
import { iosSliderEffect } from "./ios-slider";
import { exposureCarouselEffect } from "./exposure-carousel";
import { ossHeroEffect } from "./oss-hero";
import { warpOverlayEffect } from "./warp-overlay";
import { appleWatchEffect } from "./apple-watch";
import { smoothTabsEffect } from "./smooth-tabs";

export const effects: Effect[] = [
  // Text effects
  textShimmerEffect,
  gradientTextEffect,
  typewriterEffect,
  textScrambleEffect,
  wavyTextEffect,
  // Loading & feedback
  shimmerEffect,
  skeletonEffect,
  spinnerEffect,
  progressBarEffect,
  dotsLoaderEffect,
  pulsePingEffect,
  progressRingEffect,
  barEqualizerEffect,
  rippleLoaderEffect,
  confettiEffect,
  // Backgrounds & ambient
  auroraEffect,
  meshGradientEffect,
  dotGridEffect,
  floatingBlobsEffect,
  // Overlays & dialogs
  overlaysEffect,
  modalsEffect,
  toastEffect,
  drawerEffect,
  popoverEffect,
  tooltipEffect,
  familyDialogEffect,
  modalSharedLayoutEffect,
  accordionEffect,
  // Transitions & lists
  pageTransitionsEffect,
  curtainsEffect,
  staggerListEffect,
  // Micro-interactions
  hoverCardEffect,
  counterEffect,
  buttonPressEffect,
  smoothTabsEffect,
  tiltCardEffect,
  magneticButtonEffect,
  likeBurstEffect,
  // Forms & inputs
  colorPickerEffect,
  charactersRemainingEffect,
  iosSliderEffect,
  exposureCarouselEffect,
  // Heroes
  ossHeroEffect,
  // Experimental
  warpOverlayEffect,
  appleWatchEffect,
];

export function getEffect(id: string): Effect | undefined {
  return effects.find((e) => e.id === id);
}

/** Effects grouped by category, in CATEGORIES order. Empty categories are omitted. */
export function effectsByCategory(): { category: Category; effects: Effect[] }[] {
  return CATEGORIES.map((category) => ({
    category,
    effects: effects.filter((e) => e.category === category),
  })).filter((group) => group.effects.length > 0);
}
