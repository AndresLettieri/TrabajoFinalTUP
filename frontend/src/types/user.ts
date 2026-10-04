export type Role = "Admin" | "Seller";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}