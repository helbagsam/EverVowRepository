export interface Guest { id: string; name: string; phone: string; group: string; status: "Confirmed" | "Pending" | "Declined"; table: string; }
export interface Expense { id: string; name: string; vendor: string; total: number; paid: number; status: "Lunas" | "DP" | "Unpaid"; category: string; receiptUrl?: string; }
export interface Requirement { id: string; name: string; desc: string; status: "Selesai" | "Proses" | "Belum Diunggah"; file: string | null; category: string; }
export interface Activity { id: string; title: string; category: string; status: "Confirmed" | "Planning"; duration: number; needs: string; desc: string; }
export interface LogisticItem { id: string; name: string; category: string; supplier: string; cost: number; status: "Confirmed" | "Pending" | "Inquiry"; percent: number; }
export interface Member { id: string; name: string; initials: string; color: string; bgColor: string; }
export interface Category { id: string; name: string; icon: string; colorClass: string; bgClass: string; }
export interface Vendor { id: string; name: string; category: string; status: "RESEARCHING" | "CONTACTED" | "NEGOTIATING" | "BOOKED" | "COMPLETED"; totalValue: number; paidValue: number; picName: string; picPhone: string; picEmail: string; website: string; rating: number; notes: string; pushedToBudget?: boolean; }
export interface RentalItem { id: string; name: string; vendorId: string; quantity: number; arrivalStatus: "Good" | "Damaged" | "Missing" | "Pending"; returnStatus: "Good" | "Damaged" | "Missing" | "Pending"; notes: string; }
export interface HandoverItem { id: string; name: string; valueDescription: string; picName: string; status: "Pending" | "Handed Over" | "Returned"; handoverTime?: string; returnTime?: string; }
export interface LogisticsTimeline { id: string; vendorId: string; activity: string; startTime: string; endTime: string; type: "Load-In" | "Load-Out" | "Operational"; status: "Pending" | "In Progress" | "Completed"; }
export interface TransportStay { id: string; type: "Vehicle" | "Shuttle" | "Accommodation"; name: string; allocation: string; capacity: string; notes: string; }
export interface FabricSwatch { id: string; name: string; imageUrl: string; }
export interface AttireVendorNote { id: string; vendorName: string; notes: string; dueDate: string; }
export interface AttireItem { id: string; name: string; role: string; status: string; vendor: string; desc: string; measurements: string; imageUrl?: string; }
export interface Task { id: string; categoryId: string; title: string; status: "Not Started" | "In Progress" | "Completed" | "On Hold"; assigneeId: string; dueDate: string; priority: "High" | "Medium" | "Low"; desc: string; }
export interface CoupleProfile { brideName: string; groomName: string; contactEmail: string; contactPhone: string; weddingTitle: string; weddingTime: string; primaryVenue: string; }

export interface WeddingState {
  theme: "light" | "dark";
  weddingDate: string;
  coupleProfile: CoupleProfile;
  guests: Guest[];
  expenses: Expense[];
  requirements: Requirement[];
  activities: Activity[];
  attireItems: AttireItem[];
  attireVendorNotes: AttireVendorNote[];
  fabricSwatches: FabricSwatch[];
  logistics: LogisticItem[];
  tasks: Task[];
  categories: Category[];
  members: Member[];
  targetGuests: number;
  totalBudget: number;
  vendors: Vendor[];
  rentals: RentalItem[];
  handovers: HandoverItem[];
  logisticsTimelines: LogisticsTimeline[];
  transportStays: TransportStay[];
  misc: Record<string, any>;
  guestGroups: string[];
}
