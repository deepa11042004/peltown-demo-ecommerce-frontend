export interface Product {
  id: number | string;
  name: string;
  price: string;
  oldPrice?: string;
  status?: string;
  discount?: string;
  rating: number;
  image: string;
  category: string;
  description: string;
  benefits: string[];
  specs: { label: string; value: string }[];
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Almond-healthy fat, magnesium and protein snacks",
    price: "44.00",
    oldPrice: "50.00",
    status: "New",
    rating: 4.5,
    image: "/Img/almonds.jpg",
    category: "Nuts",
    description:
      "Handpicked premium almonds from the pristine orchards. Extremely rich in healthy monounsaturated fats, dietary fiber, antioxidants, magnesium, and vitamin E. Perfect for snacking, baking, or adding crunch to your morning yogurt bowls.",
    benefits: ["Rich in Vitamin E & Antioxidants", "Supports Heart Health & Blood Sugar", "Premium Crunchy Grade"],
    specs: [
      { label: "Origin", value: "Kashmir Orchards" },
      { label: "Weight", value: "500g Pack" },
      { label: "Storage", value: "Cool, dry place" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  },
  {
    id: 2,
    name: "Nuts snacks mix with different exotic fruits",
    price: "21.00",
    oldPrice: "24.00",
    status: "-12%",
    rating: 4.0,
    image: "/Img/almonds.jpg",
    category: "Mixes",
    description:
      "A delightful gourmet medley of premium dry roasted nuts and succulent dried exotic fruits. Contains golden raisins, tart cranberries, roasted cashews, almonds, and pistachios. Provides an instant energy boost with balanced nutrition.",
    benefits: ["Balanced Protein & Carbs", "No Artificial Colors or Flavors", "Excellent Pre/Post Workout Snack"],
    specs: [
      { label: "Origin", value: "Blended Premium Reserve" },
      { label: "Weight", value: "250g Pack" },
      { label: "Storage", value: "Airtight container" },
      { label: "Shelf Life", value: "9 Months" },
    ],
  },
  {
    id: 3,
    name: "Kashmiri Walnuts",
    price: "21.00",
    oldPrice: "24.00",
    status: "-12%",
    rating: 4.0,
    image: "/Img/walnuts.jpg",
    category: "Dry Fruits",
    description:
      "Extra light walnut kernels harvested directly from the valleys of Kashmir. Known for their buttery texture, rich aroma, and high concentration of Omega-3 fatty acids, making them the ultimate brain-boosting superfood.",
    benefits: ["High Omega-3 Fatty Acids", "Promotes Brain & Memory Function", "100% Organic & Raw"],
    specs: [
      { label: "Origin", value: "Kashmir Valley" },
      { label: "Weight", value: "250g Pack" },
      { label: "Grade", value: "Extra Light Halves" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  },
  {
    id: 4,
    name: "Nuts snacks mix big pack for everyday life",
    price: "36.00",
    status: "New",
    rating: 3.5,
    image: "/Img/almonds.jpg",
    category: "Mixes",
    description:
      "The ultimate family-sized super snack pack. Carefully balanced proportions of raw almonds, premium cashews, crunchy walnuts, and pumpkin seeds. Designed for busy professionals and growing families seeking clean, wholesome snacking.",
    benefits: ["Family Value Pack", "High Fiber & Zinc", "Zero Cholesterol"],
    specs: [
      { label: "Origin", value: "Everace Select Blend" },
      { label: "Weight", value: "1000g Family Pack" },
      { label: "Storage", value: "Resealable Pouch" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  },
  {
    id: 5,
    name: "Kashmiri Almond",
    price: "44.00",
    status: "New",
    rating: 4.5,
    image: "/Img/almonds.jpg",
    category: "Nuts",
    description:
      "Traditional Mamra grade Kashmiri almonds known for their distinct shape and superior oil content. Extremely prized for traditional remedies and premium festive gifting.",
    benefits: ["Superior Natural Oil Content", "Traditional Mamra Quality", "Immunity Booster"],
    specs: [
      { label: "Origin", value: "Pampore, Kashmir" },
      { label: "Weight", value: "500g Box" },
      { label: "Oil Content", value: "Grade A High" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  },
  {
    id: 6,
    name: "Kashmiri Blueberry Preserve",
    price: "36.00",
    status: "New",
    rating: 3.0,
    image: "/Img/blueberry.jpg",
    category: "Preserves",
    description:
      "Handcrafted whole wild Kashmiri blueberries gently simmered with raw organic sugar and a touch of lemon juice. Bursting with authentic mountain berry flavor and powerful antioxidants.",
    benefits: ["Whole Wild Berries", "No Pectin or Preservatives Added", "Rich in Anthocyanins"],
    specs: [
      { label: "Origin", value: "Kashmiri Highlands" },
      { label: "Weight", value: "340g Glass Jar" },
      { label: "Ingredients", value: "Blueberries, Raw Sugar, Lemon" },
      { label: "Refrigerate", value: "After opening" },
    ],
  },
  {
    id: 7,
    name: "Kashmiri Redberry Preserve",
    price: "36.00",
    status: "New",
    rating: 3.5,
    image: "/Img/blueberry.jpg",
    category: "Preserves",
    description:
      "Vibrant red mountain berries harvested at peak ripeness to create a wonderfully sweet and tart artisanal preserve. Ideal over warm toast, scones, or layered in artisanal desserts.",
    benefits: ["Vibrant Natural Color & Flavor", "Artisanal Small Batch Production", "Excellent Vitamin C Source"],
    specs: [
      { label: "Origin", value: "Himalayan Foothills" },
      { label: "Weight", value: "340g Glass Jar" },
      { label: "Serving", value: "Spread or Dessert Topping" },
      { label: "Shelf Life", value: "18 Months" },
    ],
  },
  {
    id: 8,
    name: "Kashmiri Blackberry Preserve",
    price: "36.00",
    status: "New",
    rating: 4.0,
    image: "/Img/blueberry.jpg",
    category: "Preserves",
    description:
      "Deep, rich, and intensely flavorful wild blackberry preserve. Every spoonful delivers whole fruit chunks with a beautifully complex sweet and tangy profile.",
    benefits: ["Wild Foraged Blackberries", "Intense Fruit Concentration", "Low Sugar Recipe"],
    specs: [
      { label: "Origin", value: "Kashmiri Forest Reserve" },
      { label: "Weight", value: "340g Glass Jar" },
      { label: "Texture", value: "Chunky Spread" },
      { label: "Shelf Life", value: "18 Months" },
    ],
  },
  {
    id: 9,
    name: "Kashmiri Dry Honey",
    price: "36.00",
    status: "New",
    rating: 4.5,
    image: "/Img/honey.jpeg",
    category: "Honey",
    description:
      "Pure, unheated, raw crystal honey harvested from the untouched alpine meadows. Known for its thick consistency, floral notes, and natural pollen enzymes.",
    benefits: ["Raw & Cold Extracted", "Natural Enzymes Preserved", "Soothing Throat & Immunity Support"],
    specs: [
      { label: "Origin", value: "Alpine Kashmir Valley" },
      { label: "Weight", value: "400g Jar" },
      { label: "Processing", value: "100% Unpasteurized" },
      { label: "Shelf Life", value: "24 Months" },
    ],
  },
  {
    id: 10,
    name: "Organic Cashews",
    price: "28.00",
    oldPrice: "32.00",
    discount: "-15%",
    status: "-15%",
    rating: 5.0,
    image: "/Img/almonds.jpg",
    category: "Nuts",
    description:
      "Jumbo organic W180 grade cashews dry roasted to buttery perfection. Packed with plant-based protein, copper, zinc, and healthy unsaturated fats.",
    benefits: ["Jumbo King Size Kernels", "Excellent Zinc & Copper Source", "Creamy & Buttery Texture"],
    specs: [
      { label: "Origin", value: "Goa & Southern Highlands" },
      { label: "Grade", value: "W180 Premium Whole" },
      { label: "Weight", value: "500g Pack" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  },
  {
    id: 11,
    name: "Dried Saffron Berries",
    price: "52.00",
    status: "New",
    rating: 4.8,
    image: "/Img/honey.jpeg",
    category: "Berries",
    description:
      "Sun-dried golden berries infused with premium Kashmiri saffron strands. Delivers an opulent sweet and musky flavor unmatched in artisanal confectionery.",
    benefits: ["Infused with Mongra Saffron", "Rich in Carotenoids & Vitamin A", "Luxurious Gourmet Treat"],
    specs: [
      { label: "Origin", value: "Pampore Reserve" },
      { label: "Infusion", value: "100% Pure Saffron Strands" },
      { label: "Weight", value: "200g Jar" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  },
  {
    id: 12,
    name: "Pistachio Kernels",
    price: "31.00",
    rating: 4.2,
    image: "/Img/walnuts.jpg",
    category: "Nuts",
    description:
      "Emerald green raw pistachio kernels without shells. Highly valued for their vibrant natural green hue, rich protein content, and distinct earthy sweetness.",
    benefits: ["Raw Shelled Emerald Kernels", "High Lutein & Eye Health Support", "Excellent Baking Ingredient"],
    specs: [
      { label: "Origin", value: "Kashmiri Highlands" },
      { label: "Color", value: "Premium Emerald Green" },
      { label: "Weight", value: "250g Vacuum Pack" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  },
  {
    id: 13,
    name: "Pure Acacia Honey",
    price: "18.00",
    status: "New",
    rating: 4.5,
    image: "/Img/honey.jpeg",
    category: "Honey",
    description:
      "Exquisite single-origin acacia floral honey. Remains beautifully liquid and crystal clear for months with a delicate vanilla note perfect for sweetening teas and artisanal cheeses.",
    benefits: ["Low Glycemic Index", "Remains Liquid Naturally", "Delicate Floral Aroma"],
    specs: [
      { label: "Origin", value: "Acacia Forest Reserve" },
      { label: "Clarity", value: "Crystal Clear Extra Light" },
      { label: "Weight", value: "350g Glass Jar" },
      { label: "Shelf Life", value: "36 Months" },
    ],
  },
];
