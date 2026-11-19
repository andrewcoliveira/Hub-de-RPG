// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Tabelas de recompensa (Capítulo 8 do livro)
//  Os dados ficam em ../data/*.json (conferidos com o PDF); aqui só os tipos.
//  Toda tabela de d% é uma lista de [limite superior, resultado].
// ══════════════════════════════════════════════════════════════════

import accessories from "../data/accessories.json";
import amulets from "../data/amulets.json";
import armorPowers from "../data/armor_powers.json";
import armors from "../data/armors.json";
import armorsSpecific from "../data/armors_specific.json";
import arts from "../data/arts.json";
import clothings from "../data/clothings.json";
import equipment from "../data/equipment.json";
import gems from "../data/gems.json";
import items from "../data/items.json";
import jutsusBasic from "../data/jutsus_basic.json";
import jutsusMedium from "../data/jutsus_medium.json";
import magicArmors from "../data/magic_armors.json";
import magicItems from "../data/magic_items.json";
import magicWeapons from "../data/magic_weapons.json";
import materials from "../data/materials.json";
import ofuda from "../data/ofuda.json";
import riches from "../data/riches.json";
import weaponPowersMelee from "../data/weapon_powers_melee.json";
import weaponPowersRanged from "../data/weapon_powers_ranged.json";
import weapons from "../data/weapons.json";
import weaponsSpecific from "../data/weapons_specific.json";

export type Table<T> = [number, T][];
export type Tier = "menor" | "medio" | "maior";
export type ByTier<T> = Partial<Record<Tier, Table<T>>>;

export type EquipDict = "items" | "weapons" | "armors" | "clothings";
export type RareDict = "gems" | "arts";

export type PriceFormula = number | { rolls: number; die: number; mult?: number };

export interface RareRange { price: PriceFormula; examples: string[] }
export interface NamedPrice { name: string; price: number }
export interface Power { name: string; bonus_equiv: number }

/** Ações que as tabelas podem mandar executar. "-" = nada. */
export type Action =
  | "-"
  | string
  | { type: "equipment"; dict: EquipDict; special?: boolean; masterwork?: boolean }
  | { type: "riches"; args: [number, number, number, number, string] }
  | { type: "rare"; args: [number, number, number]; dict: RareDict }
  | { type: "magic_item"; tier: Tier };

export type MagicCategory = "armas" | "armaduras" | "ofuda" | "amuletos" | "acessorios";

export type GearRoll =
  | { type: "magic_bonus"; bonus: number; price_add: number }
  | { type: "special_power"; dict: string }
  | { type: "specific"; dict: string };

export interface OfudaRoll { type: "jutsu"; tier: "basic" | "medium"; price: number }

export const ND_LIST = ["1/3", "1/2", ...Array.from({ length: 20 }, (_, i) => String(i + 1))];

export const TABLES = {
  richesByNd: riches as unknown as Record<string, Table<Action>>,
  equipmentByNd: equipment as unknown as Record<string, Table<Action>>,
  equip: {
    items: items as Table<Action>,
    weapons: weapons as Table<Action>,
    armors: armors as unknown as Table<Action>,
    clothings: clothings as Table<Action>,
  } satisfies Record<EquipDict, Table<Action>>,
  materials: materials as Table<string>,
  rare: { gems: gems as Table<RareRange>, arts: arts as Table<RareRange> } satisfies Record<RareDict, Table<RareRange>>,
  magicItems: magicItems as unknown as ByTier<{ type: "magic_item_type"; category: MagicCategory }>,
  magicWeapons: magicWeapons as unknown as ByTier<GearRoll>,
  magicArmors: magicArmors as unknown as ByTier<GearRoll>,
  weaponPowersMelee: weaponPowersMelee as ByTier<Power>,
  weaponPowersRanged: weaponPowersRanged as ByTier<Power>,
  armorPowers: armorPowers as ByTier<Power>,
  weaponsSpecific: weaponsSpecific as ByTier<NamedPrice>,
  armorsSpecific: armorsSpecific as ByTier<NamedPrice>,
  ofuda: ofuda as unknown as ByTier<OfudaRoll>,
  jutsusBasic: jutsusBasic as Table<string>,
  jutsusMedium: jutsusMedium as Table<string>,
  amulets: amulets as ByTier<NamedPrice>,
  accessories: accessories as ByTier<NamedPrice>,
};
