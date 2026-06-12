// Palettes lifted from design_prototype/Pokemon Splendor.dc.html (THEMES()).
// CSS gradients are represented as color-stop tuples for expo-linear-gradient;
// theme A's radial app background is approximated as a vertical linear gradient.
export type ThemeId = 'A' | 'B' | 'C';

export type GradientStops = readonly [string, string, ...string[]];

export interface Theme {
  id: ThemeId;
  label: string;
  ink: string;
  inkDim: string;
  appBg: GradientStops;
  surface: string;
  ring: string;
  ring2: string;
  bezel: string;
  topBg: GradientStops;
  topText: string;
  topDim: string;
  pillBg: string;
  pillText: string;
  cardBg: GradientStops;
  cardText: string;
  cardSub: string;
  deckBg: string;
  dock: GradientStops;
  dockText: string;
  dockDim: string;
  tpDock: string;
  accent: string;
  accentBorder: string;
  accentText: string;
  accentSolid: string;
  accentGlow: string;
  mewBg: string;
  sheen: string;
  dockBtnBg: string;
  dockBtnText: string;
  dockGhostBorder: string;
  modalBg: string;
  modalText: string;
  overlay: string;
}

const flat = (color: string): GradientStops => [color, color];

export const themes: Record<ThemeId, Theme> = {
  A: {
    id: 'A',
    label: 'TCG',
    ink: '#eef3fa',
    inkDim: '#9aa9bd',
    appBg: ['#2b3d54', '#1a2533', '#0f1620'],
    surface: 'rgba(255,255,255,0.06)',
    ring: 'rgba(255,255,255,0.09)',
    ring2: 'rgba(255,255,255,0.2)',
    bezel: '#06080c',
    topBg: flat('rgba(8,12,18,0.5)'),
    topText: '#eaf0f8',
    topDim: '#94a3b8',
    pillBg: 'rgba(255,255,255,0.07)',
    pillText: '#eaf0f8',
    cardBg: ['#202c3e', '#161f2c'],
    cardText: '#eef3fa',
    cardSub: 'rgba(214,224,238,0.6)',
    deckBg: '#1d2838',
    dock: flat('rgba(8,12,18,0.55)'),
    dockText: '#eef3fa',
    dockDim: '#8a99ad',
    tpDock: '#ffcb05',
    accent: '#ffcb05',
    accentBorder: '#e0ad00',
    accentText: '#23304a',
    accentSolid: '#ffcb05',
    accentGlow: 'rgba(255,203,5,0.3)',
    mewBg: 'rgba(228,107,176,0.12)',
    sheen: 'rgba(255,255,255,0.22)',
    dockBtnBg: '#ffcb05',
    dockBtnText: '#23304a',
    dockGhostBorder: 'rgba(255,255,255,0.25)',
    modalBg: '#18222f',
    modalText: '#eef3fa',
    overlay: 'rgba(4,7,12,0.7)',
  },
  B: {
    id: 'B',
    label: 'Clean',
    ink: '#212a36',
    inkDim: '#7c8696',
    appBg: ['#eef3fa', '#e1e8f2'],
    surface: '#ffffff',
    ring: 'rgba(20,28,40,0.10)',
    ring2: 'rgba(20,28,40,0.18)',
    bezel: '#222b38',
    topBg: flat('#ffffff'),
    topText: '#212a36',
    topDim: '#8893a3',
    pillBg: '#eef3fa',
    pillText: '#212a36',
    cardBg: flat('#ffffff'),
    cardText: '#212a36',
    cardSub: '#8893a3',
    deckBg: '#e6ecf5',
    dock: flat('#ffffff'),
    dockText: '#212a36',
    dockDim: '#8893a3',
    tpDock: '#2E8BE6',
    accent: '#2E8BE6',
    accentBorder: '#2576c9',
    accentText: '#ffffff',
    accentSolid: '#2E8BE6',
    accentGlow: 'rgba(46,139,230,0.22)',
    mewBg: 'rgba(228,107,176,0.08)',
    sheen: 'rgba(255,255,255,0.6)',
    dockBtnBg: '#2E8BE6',
    dockBtnText: '#ffffff',
    dockGhostBorder: 'rgba(20,28,40,0.18)',
    modalBg: '#ffffff',
    modalText: '#212a36',
    overlay: 'rgba(20,28,40,0.45)',
  },
  C: {
    id: 'C',
    label: 'Pokédex',
    ink: '#23282f',
    inkDim: '#7c8696',
    appBg: ['#f8fafd', '#e9eef5'],
    surface: '#ffffff',
    ring: 'rgba(20,28,40,0.10)',
    ring2: 'rgba(20,28,40,0.18)',
    bezel: '#b1271c',
    topBg: ['#e8483b', '#c8362b'],
    topText: '#ffffff',
    topDim: 'rgba(255,255,255,0.82)',
    pillBg: '#ffffff',
    pillText: '#c8362b',
    cardBg: flat('#ffffff'),
    cardText: '#23282f',
    cardSub: '#8893a3',
    deckBg: '#eef2f8',
    dock: ['#e8483b', '#cf3a2e'],
    dockText: '#ffffff',
    dockDim: 'rgba(255,255,255,0.82)',
    tpDock: '#ffffff',
    accent: '#e8483b',
    accentBorder: '#c5362b',
    accentText: '#ffffff',
    accentSolid: '#e8483b',
    accentGlow: 'rgba(232,72,59,0.22)',
    mewBg: 'rgba(228,107,176,0.08)',
    sheen: 'rgba(255,255,255,0.6)',
    dockBtnBg: '#ffffff',
    dockBtnText: '#e8483b',
    dockGhostBorder: 'rgba(255,255,255,0.5)',
    modalBg: '#ffffff',
    modalText: '#23282f',
    overlay: 'rgba(40,20,18,0.5)',
  },
};

export const THEME_IDS: readonly ThemeId[] = ['A', 'B', 'C'];
