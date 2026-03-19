let isFlashing = false;

const DOT_DURATION = 200;
const DASH_DURATION = 600;
const GAP_DURATION = 100;
const LETTER_GAP_DURATION = 400;

const SOS_PATTERN = [
  { type: 'dot', duration: DOT_DURATION },
  { type: 'gap', duration: GAP_DURATION },
  { type: 'dot', duration: DOT_DURATION },
  { type: 'gap', duration: GAP_DURATION },
  { type: 'dot', duration: DOT_DURATION },
  { type: 'letterGap', duration: LETTER_GAP_DURATION },
  { type: 'dash', duration: DASH_DURATION },
  { type: 'gap', duration: GAP_DURATION },
  { type: 'dash', duration: DASH_DURATION },
  { type: 'gap', duration: GAP_DURATION },
  { type: 'dash', duration: DASH_DURATION },
  { type: 'letterGap', duration: LETTER_GAP_DURATION },
  { type: 'dot', duration: DOT_DURATION },
  { type: 'gap', duration: GAP_DURATION },
  { type: 'dot', duration: DOT_DURATION },
  { type: 'gap', duration: GAP_DURATION },
  { type: 'dot', duration: DOT_DURATION },
];

export const flashService = {
  async startSOSFlash(): Promise<void> {
    if (isFlashing) return;
    isFlashing = true;
    console.log('Flash SOS started - camera torch control requires CameraView component in UI');
  },

  async stopSOSFlash(): Promise<void> {
    isFlashing = false;
    console.log('Flash SOS stopped');
  },

  getIsFlashing(): boolean {
    return isFlashing;
  },
};
