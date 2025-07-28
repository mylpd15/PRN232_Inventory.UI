export interface Warehouse {
  WarehouseID: number;
  WarehouseName: string;
  IsRefrigerated: boolean;
  email: string;
  LocationID: number;
  Location: Location | null;
}