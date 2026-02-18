export type ListingCategory =
  | 'tickets'
  | 'accommodation'
  | 'transport'
  | 'outfits'
  | 'accessories'
  | 'other';

export type ListingStatus = 'active' | 'sold' | 'reserved' | 'expired';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  status: ListingStatus;
  image_url: string | null;
  seller_id: string;
  seller?: Profile;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
  listing?: Listing;
}
