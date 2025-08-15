export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

export interface Special {
  id: number;
  product: Product;
  discount: number;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  hours: {
    weekdays: string;
    weekend: string;
  };
}