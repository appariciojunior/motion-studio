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
import { splitTextEffect } from "./split-text";
import { morphingTextEffect } from "./morphing-text";
import { rollingTextEffect } from "./rolling-text";
import { gradientTextEffect } from "./gradient-text";
import { auroraEffect } from "./aurora";
import { starsBackgroundEffect } from "./stars-background";
import { bubbleBackgroundEffect } from "./bubble-background";
import { fireworksBackgroundEffect } from "./fireworks-background";
import { hexagonBackgroundEffect } from "./hexagon-background";
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
import { highlightTextEffect } from "./highlight-text";
import { fillTextEffect } from "./fill-text";
import { slidingNumberEffect } from "./sliding-number";
import { numberCounterEffect } from "./number-counter";
import { cursorTrailEffect } from "./cursor-trail";
import { bobbleHoverEffect } from "./bobble-hover";
import { flipCardEffect } from "./flip-card";
import { cardStackEffect } from "./card-stack";
import { tickerMarqueeEffect } from "./ticker-marquee";
import { staggeredGridEffect } from "./staggered-grid";
import { reorderListEffect } from "./reorder-list";
import { copyButtonEffect } from "./copy-button";
import { rippleButtonEffect } from "./ripple-button";
import { liquidButtonEffect } from "./liquid-button";

export const effects: Effect[] = [
  // Text effects
  textShimmerEffect,
  gradientTextEffect,
  typewriterEffect,
  textScrambleEffect,
  wavyTextEffect,
  splitTextEffect,
  morphingTextEffect,
  rollingTextEffect,
  highlightTextEffect,
  fillTextEffect,
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
  starsBackgroundEffect,
  bubbleBackgroundEffect,
  fireworksBackgroundEffect,
  hexagonBackgroundEffect,
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
  tickerMarqueeEffect,
  staggeredGridEffect,
  reorderListEffect,
  // Micro-interactions
  hoverCardEffect,
  counterEffect,
  numberCounterEffect,
  slidingNumberEffect,
  buttonPressEffect,
  smoothTabsEffect,
  tiltCardEffect,
  magneticButtonEffect,
  likeBurstEffect,
  cursorTrailEffect,
  bobbleHoverEffect,
  flipCardEffect,
  cardStackEffect,
  copyButtonEffect,
  rippleButtonEffect,
  liquidButtonEffect,
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
