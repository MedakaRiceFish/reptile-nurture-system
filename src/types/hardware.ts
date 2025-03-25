
export interface HardwareItem {
  id: string;
  name: string;
  type: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  enclosureId: string;
}
