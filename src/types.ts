export type ExperienceLevel = 'beginner' | 'intermediate' | 'pro';
export type PostType = 'general' | 'catch' | 'spot' | 'gear';
export type MarketplaceCategory = 'Joran' | 'Reel' | 'Senar' | 'Umpan' | 'Aksesoris';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  experience_level: ExperienceLevel | null;
  fishing_style: 'freshwater' | 'saltwater' | 'both' | null;
  latitude: number | null;
  longitude: number | null;
  role: 'user' | 'admin';
  updated_at: string;
}

export interface UserGear {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface UserFavoriteSpot {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  event_date: string | null;
  created_at: string;
  created_by: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  type: PostType;
  created_at: string;
  profiles?: Profile;
  fishing_spots?: FishingSpot[];
  gear_setups?: GearSetup[];
  likes?: { user_id: string }[];
  comments?: { id: string }[];
}

export interface FishingSpot {
  id: string;
  post_id: string;
  name: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  water_condition: string | null;
  best_time: string | null;
}

export interface GearSetup {
  id: string;
  post_id: string;
  rod: string | null;
  reel: string | null;
  line: string | null;
  lure: string | null;
  technique: string | null;
}

export interface MarketplaceItem {
  id: string;
  user_id: string;
  title: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category: MarketplaceCategory;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}
