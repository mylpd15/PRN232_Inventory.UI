import { Locations } from "./Locations";

export interface Warehouse {
  WarehouseID: number;
  WarehouseName: string;
  IsRefrigerated: boolean;
  LocationID: number;
  Location: Locations | null;
}