export type Product = {
  name: string;
  price: string;
  img1: string;
  img2: string;
};

export type Collection = {
  slug: string;
  season: string;
  name: string;
  description: string;
  image: string;
  pieceCount: number;
  status: "available" | "coming-soon";
  products: Product[];
};

export const products: Product[] = [
  {
    name: "Tailored Wrap Dress",
    price: "₦165,000",
    img1: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&q=80",
  },
  {
    name: "Ivory Tailored Set",
    price: "₦210,000",
    img1: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=700&q=80",
  },
  {
    name: "Aso-Oke Blazer",
    price: "₦245,000",
    img1: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80",
  },
  {
    name: "Clay Silk Gown",
    price: "₦298,000",
    img1: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&q=80",
  },
  {
    name: "Sand Linen Trouser",
    price: "₦98,000",
    img1: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80",
  },
];

export const collections: Collection[] = [
  {
    slug: "ss26-new-collection",
    season: "SS26",
    name: "New Collection",
    description:
      "Signature pieces finished in Aba — ready-to-wear and made-to-order silhouettes for the season ahead.",
    image:
      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&q=80",
    pieceCount: 5,
    status: "available",
    products,
  },
  {
    slug: "resort-25",
    season: "Resort 25",
    name: "Resort Collection",
    description:
      "Light linen and silk pieces made for warm weather — tailored for travel between Aba, London, and Accra.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    pieceCount: 4,
    status: "available",
    products: products.slice(0, 4),
  },
  {
    slug: "aw25",
    season: "AW25",
    name: "Autumn Collection",
    description:
      "Layered tailoring and rich structured fabrics — arriving soon from our Aba studio.",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80",
    pieceCount: 0,
    status: "coming-soon",
    products: [],
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}
