/**
 * Generates src/data/first-151.json from the canonical Pokemon mapping.
 * Run with: npx ts-node scripts/generateFirst151.ts
 *
 * Type mapping (Fix A from design.md):
 *   Fire     = Fire + Fighting + Rock (primary)
 *   Water    = Water + Ice (primary Water)
 *   Grass    = Grass + Bug + Poison + Dragon (non-legendary)
 *   Electric = Electric + Normal + Normal/Flying + Ground (only)
 *   Psychic  = Psychic + Ghost + "mystical Normals" (Clefairy/Jigglypuff/Chansey lines) + Jynx
 *
 * Excluded: #132 Ditto (wild token), #144/145/146/149/150 Legendaries, #151 Mew
 */

import * as fs from 'fs';
import * as path from 'path';

type EnergyType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic';
type EvolutionTier = 1 | 2 | 3;

interface CardDef {
  pokedexNumber: number;
  name: string;
  energyType: EnergyType;
  evolutionTier: EvolutionTier;
}

// Each Tier 3 card gets a secondary cost type for variety
const T3_SECONDARY: Record<EnergyType, EnergyType> = {
  Fire: 'Water',
  Water: 'Grass',
  Grass: 'Fire',
  Electric: 'Psychic',
  Psychic: 'Water',
};

// Starters (T3) get boosted TP and costs
const STARTER_T3 = new Set([3, 6, 9]);
// Strong single-stage finals get TP 1 instead of 0
const STRONG_SINGLES = new Set([83, 106, 107, 113, 114, 115, 122, 123, 124, 125, 126, 127, 128, 131, 137, 142, 143]);
// Strong 2-stage finals get TP 2 instead of 1
const STRONG_T2 = new Set([59, 65, 76, 94, 130]);
// Magikarp is free
const FREE_CARDS = new Set([129]);

// [pokedexNumber, name, energyType, evolutionTier]
const POKEMON: [number, string, EnergyType, EvolutionTier][] = [
  [1, 'Bulbasaur', 'Grass', 1],
  [2, 'Ivysaur', 'Grass', 2],
  [3, 'Venusaur', 'Grass', 3],
  [4, 'Charmander', 'Fire', 1],
  [5, 'Charmeleon', 'Fire', 2],
  [6, 'Charizard', 'Fire', 3],
  [7, 'Squirtle', 'Water', 1],
  [8, 'Wartortle', 'Water', 2],
  [9, 'Blastoise', 'Water', 3],
  [10, 'Caterpie', 'Grass', 1],
  [11, 'Metapod', 'Grass', 2],
  [12, 'Butterfree', 'Grass', 3],
  [13, 'Weedle', 'Grass', 1],
  [14, 'Kakuna', 'Grass', 2],
  [15, 'Beedrill', 'Grass', 3],
  [16, 'Pidgey', 'Electric', 1],
  [17, 'Pidgeotto', 'Electric', 2],
  [18, 'Pidgeot', 'Electric', 3],
  [19, 'Rattata', 'Electric', 1],
  [20, 'Raticate', 'Electric', 2],
  [21, 'Spearow', 'Electric', 1],
  [22, 'Fearow', 'Electric', 2],
  [23, 'Ekans', 'Grass', 1],
  [24, 'Arbok', 'Grass', 2],
  [25, 'Pikachu', 'Electric', 1],
  [26, 'Raichu', 'Electric', 2],
  [27, 'Sandshrew', 'Electric', 1],
  [28, 'Sandslash', 'Electric', 2],
  [29, 'Nidoran-F', 'Grass', 1],
  [30, 'Nidorina', 'Grass', 2],
  [31, 'Nidoqueen', 'Grass', 3],
  [32, 'Nidoran-M', 'Grass', 1],
  [33, 'Nidorino', 'Grass', 2],
  [34, 'Nidoking', 'Grass', 3],
  [35, 'Clefairy', 'Psychic', 1],
  [36, 'Clefable', 'Psychic', 2],
  [37, 'Vulpix', 'Fire', 1],
  [38, 'Ninetales', 'Fire', 2],
  [39, 'Jigglypuff', 'Psychic', 1],
  [40, 'Wigglytuff', 'Psychic', 2],
  [41, 'Zubat', 'Grass', 1],
  [42, 'Golbat', 'Grass', 2],
  [43, 'Oddish', 'Grass', 1],
  [44, 'Gloom', 'Grass', 2],
  [45, 'Vileplume', 'Grass', 3],
  [46, 'Paras', 'Grass', 1],
  [47, 'Parasect', 'Grass', 2],
  [48, 'Venonat', 'Grass', 1],
  [49, 'Venomoth', 'Grass', 2],
  [50, 'Diglett', 'Electric', 1],
  [51, 'Dugtrio', 'Electric', 2],
  [52, 'Meowth', 'Electric', 1],
  [53, 'Persian', 'Electric', 2],
  [54, 'Psyduck', 'Water', 1],
  [55, 'Golduck', 'Water', 2],
  [56, 'Mankey', 'Fire', 1],
  [57, 'Primeape', 'Fire', 2],
  [58, 'Growlithe', 'Fire', 1],
  [59, 'Arcanine', 'Fire', 2],
  [60, 'Poliwag', 'Water', 1],
  [61, 'Poliwhirl', 'Water', 2],
  [62, 'Poliwrath', 'Water', 3],
  [63, 'Abra', 'Psychic', 1],
  [64, 'Kadabra', 'Psychic', 2],
  [65, 'Alakazam', 'Psychic', 3],
  [66, 'Machop', 'Fire', 1],
  [67, 'Machoke', 'Fire', 2],
  [68, 'Machamp', 'Fire', 3],
  [69, 'Bellsprout', 'Grass', 1],
  [70, 'Weepinbell', 'Grass', 2],
  [71, 'Victreebel', 'Grass', 3],
  [72, 'Tentacool', 'Water', 1],
  [73, 'Tentacruel', 'Water', 2],
  [74, 'Geodude', 'Fire', 1],
  [75, 'Graveler', 'Fire', 2],
  [76, 'Golem', 'Fire', 3],
  [77, 'Ponyta', 'Fire', 1],
  [78, 'Rapidash', 'Fire', 2],
  [79, 'Slowpoke', 'Water', 1],
  [80, 'Slowbro', 'Water', 2],
  [81, 'Magnemite', 'Electric', 1],
  [82, 'Magneton', 'Electric', 2],
  [83, 'Farfetchd', 'Electric', 1],
  [84, 'Doduo', 'Electric', 1],
  [85, 'Dodrio', 'Electric', 2],
  [86, 'Seel', 'Water', 1],
  [87, 'Dewgong', 'Water', 2],
  [88, 'Grimer', 'Grass', 1],
  [89, 'Muk', 'Grass', 2],
  [90, 'Shellder', 'Water', 1],
  [91, 'Cloyster', 'Water', 2],
  [92, 'Gastly', 'Psychic', 1],
  [93, 'Haunter', 'Psychic', 2],
  [94, 'Gengar', 'Psychic', 3],
  [95, 'Onix', 'Fire', 1],
  [96, 'Drowzee', 'Psychic', 1],
  [97, 'Hypno', 'Psychic', 2],
  [98, 'Krabby', 'Water', 1],
  [99, 'Kingler', 'Water', 2],
  [100, 'Voltorb', 'Electric', 1],
  [101, 'Electrode', 'Electric', 2],
  [102, 'Exeggcute', 'Grass', 1],
  [103, 'Exeggutor', 'Grass', 2],
  [104, 'Cubone', 'Electric', 1],
  [105, 'Marowak', 'Electric', 2],
  [106, 'Hitmonlee', 'Fire', 1],
  [107, 'Hitmonchan', 'Fire', 1],
  [108, 'Lickitung', 'Electric', 1],
  [109, 'Koffing', 'Grass', 1],
  [110, 'Weezing', 'Grass', 2],
  [111, 'Rhyhorn', 'Fire', 1],
  [112, 'Rhydon', 'Fire', 2],
  [113, 'Chansey', 'Psychic', 1],
  [114, 'Tangela', 'Grass', 1],
  [115, 'Kangaskhan', 'Electric', 1],
  [116, 'Horsea', 'Water', 1],
  [117, 'Seadra', 'Water', 2],
  [118, 'Goldeen', 'Water', 1],
  [119, 'Seaking', 'Water', 2],
  [120, 'Staryu', 'Water', 1],
  [121, 'Starmie', 'Water', 2],
  [122, 'Mr. Mime', 'Psychic', 1],
  [123, 'Scyther', 'Grass', 1],
  [124, 'Jynx', 'Psychic', 1],
  [125, 'Electabuzz', 'Electric', 1],
  [126, 'Magmar', 'Fire', 1],
  [127, 'Pinsir', 'Grass', 1],
  [128, 'Tauros', 'Electric', 1],
  [129, 'Magikarp', 'Water', 1],
  [130, 'Gyarados', 'Water', 2],
  [131, 'Lapras', 'Water', 1],
  [133, 'Eevee', 'Electric', 1],
  [134, 'Vaporeon', 'Water', 2],
  [135, 'Jolteon', 'Electric', 2],
  [136, 'Flareon', 'Fire', 2],
  [137, 'Porygon', 'Electric', 1],
  [138, 'Omanyte', 'Fire', 1],
  [139, 'Omastar', 'Fire', 2],
  [140, 'Kabuto', 'Fire', 1],
  [141, 'Kabutops', 'Fire', 2],
  [142, 'Aerodactyl', 'Fire', 1],
  [143, 'Snorlax', 'Electric', 1],
  [147, 'Dratini', 'Grass', 1],
  [148, 'Dragonair', 'Grass', 2],
];

function buildCost(energyType: EnergyType, tier: EvolutionTier, num: number) {
  if (FREE_CARDS.has(num)) return {};

  if (tier === 1) {
    const base = STRONG_SINGLES.has(num) ? 3 : 2;
    return { [energyType]: base };
  }

  if (tier === 2) {
    const base = STRONG_T2.has(num) ? 4 : 3;
    return { [energyType]: base };
  }

  // Tier 3
  const base = STARTER_T3.has(num) ? 7 : 5;
  const secondary = T3_SECONDARY[energyType];
  return { [energyType]: base, [secondary]: STARTER_T3.has(num) ? 3 : 2 };
}

function buildTP(tier: EvolutionTier, num: number): number {
  if (tier === 1) return STRONG_SINGLES.has(num) ? 1 : 0;
  if (tier === 2) return STRONG_T2.has(num) ? 2 : 1;
  return STARTER_T3.has(num) ? 5 : 3;
}

const cards = POKEMON.map(([pokedexNumber, name, energyType, evolutionTier]) => ({
  pokedexNumber,
  name,
  energyType,
  evolutionTier,
  cost: buildCost(energyType, evolutionTier, pokedexNumber),
  trainerPoints: buildTP(evolutionTier, pokedexNumber),
  typeBonus: pokedexNumber === 133 ? null : energyType, // Eevee has no type bonus
}));

const output = { cards };
const outPath = path.join(__dirname, '../src/data/first-151.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Generated ${cards.length} cards → ${outPath}`);

// Sanity check
const counts: Record<string, number> = {};
cards.forEach(c => { counts[c.energyType] = (counts[c.energyType] ?? 0) + 1; });
console.log('Type distribution:', counts);
console.log('Total:', cards.length);
