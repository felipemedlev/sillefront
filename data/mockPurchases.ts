import { BasicPerfumeInfo } from '../types/perfume'; // Import perfume info type

// Define the structure for an item within a purchase
export type PurchaseItem = {
  name: string; // e.g., "AI Box (4x5ml)", "Perfume Name (Decant 5ml)"
  quantity: number;
  price: number; // Price for this item line (quantity * unit price)
  perfumes?: BasicPerfumeInfo[]; // Optional: Array of perfumes included in this item (for boxes)
};

// Define the structure for a purchase record
export type Purchase = {
  id: string; // Unique order identifier, e.g., 'ORD-12345'
  date: string; // Purchase date, e.g., '2025-03-15'
  totalPrice: number; // Total price for the entire order
  items: PurchaseItem[]; // Array of items included in the purchase
  status: 'Entregado' | 'En Camino' | 'Procesando'; // Status of the order
};

// Export an array of mock purchase data
export const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'ORD-78901',
    date: '2025-03-28',
    totalPrice: 50000,
    items: [
      {
        name: 'AI Box Pro (4x5ml)', quantity: 1, price: 50000, perfumes: [
          // Sample perfumes for this box (using BasicPerfumeInfo structure)
          { id: '62615', name: 'Angels\' Share', brand: 'Kilian', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.62615.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.62615.jpg' },
          { id: '13016', name: 'Dior Homme Intense 2011', brand: 'Dior', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.13016.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.13016.jpg' },
          { id: '75805', name: 'Khamrah', brand: 'Lattafa Perfumes', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.75805.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.75805.jpg' },
          { id: '81642', name: 'Le Male Elixir', brand: 'Jean Paul Gaultier', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.81642.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.81642.jpg' },
        ]
      },
    ],
    status: 'Entregado',
  },
  {
    id: 'ORD-45678',
    date: '2025-02-15',
    totalPrice: 38500,
    items: [
      {
        name: 'Box Personalizado (4x5ml)', quantity: 1, price: 38500, perfumes: [
          { id: '9099', name: 'Bleu de Chanel', brand: 'Chanel', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.9099.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.9099.jpg' },
          { id: '410', name: 'Acqua di Gio', brand: 'Giorgio Armani', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.410.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.410.jpg' },
          { id: '31861', name: 'Sauvage', brand: 'Dior', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.31861.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.31861.jpg' },
          { id: '485', name: 'Light Blue', brand: 'Dolce & Gabbana', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.485.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.485.jpg' },
        ]
      },
    ],
    status: 'Entregado',
  },
  {
    id: 'ORD-12345',
    date: '2025-01-10',
    totalPrice: 20000,
    items: [
      {
        name: 'AI Box Básico (4x3ml)', quantity: 1, price: 20000, perfumes: [
          { id: '14982', name: 'La Vie Est Belle', brand: 'Lancôme', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.14982.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.14982.jpg' },
          { id: '210', name: 'J\'adore', brand: 'Dior', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.210.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.210.jpg' },
          { id: '83483', name: 'Goddess', brand: 'Burberry', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.83483.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.83483.jpg' },
          { id: '485', name: 'Light Blue', brand: 'Dolce & Gabbana', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.485.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.485.jpg' }, // Added one more
        ]
      },
    ],
    status: 'Entregado',
  },
  {
    id: 'ORD-99001',
    date: '2025-04-01', // Today's date for variety
    totalPrice: 30000,
    items: [
      {
        name: 'AI Box Medio (4x5ml)', quantity: 1, price: 30000, perfumes: [
          { id: '50757', name: 'Y Eau de Parfum', brand: 'Yves Saint Laurent', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.50757.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.50757.jpg' },
          { id: '72158', name: 'Le Beau Le Parfum', brand: 'Jean Paul Gaultier', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.72158.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.72158.jpg' },
          { id: '39681', name: 'Good Girl', brand: 'Carolina Herrera', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.39681.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.39681.jpg' },
          { id: '25324', name: 'Black Opium', brand: 'Yves Saint Laurent', thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.25324.jpg', fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.25324.jpg' },
        ]
      },
    ],
    status: 'En Camino', // Different status
  },
];