export interface ListingImage {
  id: string;
  order: number;
  url: string;
}

export interface ListingCategory {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
}

export interface ListingAddress {
  state?: string | null;
}

export interface Listing {
  id: string;
  secondaryId: number;
  listingTitle: string;
  listingDescription: string | null;
  sellingPrice: number;
  appraisedPrice: number | null;
  itemBrand: string | null;
  itemAge: number | null;
  itemLength: number | null;
  itemWidth: number | null;
  itemHeight: number | null;
  itemWeight: number | null;
  vin: string | null;
  deliveryMethod: string | null;
  isPickupAvailable: boolean | null;
  isAuction: boolean;
  status: string;
  category: ListingCategory;
  address: ListingAddress | null;
  listingImages: ListingImage[];
}
