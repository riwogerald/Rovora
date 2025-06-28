export interface Game {
  id: string;
  name: string;
  slug: string;
  description?: string;
  released?: string;
  background_image?: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic?: number;
  playtime: number;
  platforms: Platform[];
  genres: Genre[];
  tags: Tag[];
  developers: Developer[];
  publishers: Publisher[];
  esrb_rating?: ESRBRating;
  screenshots?: Screenshot[];
  price?: GamePrice;
  stores: Store[];
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  image?: string;
  year_end?: number;
  year_start?: number;
  games_count: number;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
}

export interface Developer {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background?: string;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background?: string;
}

export interface ESRBRating {
  id: number;
  name: string;
  slug: string;
}

export interface Screenshot {
  id: number;
  image: string;
  width: number;
  height: number;
}

export interface GamePrice {
  current: number;
  original?: number;
  discount?: number;
  currency: string;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  domain: string;
  games_count: number;
  image_background?: string;
}

export interface GameFilters {
  search?: string;
  genres?: number[];
  platforms?: number[];
  tags?: number[];
  developers?: number[];
  publishers?: number[];
  rating_min?: number;
  rating_max?: number;
  metacritic_min?: number;
  metacritic_max?: number;
  released_min?: string;
  released_max?: string;
  ordering?: string;
  page_size?: number;
  page?: number;
}

export interface GameSearchResult {
  count: number;
  next?: string;
  previous?: string;
  results: Game[];
}