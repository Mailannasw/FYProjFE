// Scryfall API card model (Scryfall, 2025)
// ? means optional
export interface ScryfallCard {
  object: string;
  id: string;
  oracle_id: string;
  multiverse_ids?: number[];
  mtgo_id?: number;
  mtgo_foil_id?: number;
  tcgplayer_id?: number;
  cardmarket_id?: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
    border_crop?: string;
  };
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  legalities: {
    [format: string]: string;
  };
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  flavor_text?: string;
  card_back_id: string;
  artist: string;
  prices: {
    [currency: string]: string;
  };
  related_uris: {
    [name: string]: string;
  };
  purchase_uris: {
    [source: string]: string;
  };
}
