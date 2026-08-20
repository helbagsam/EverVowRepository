import type { WeddingState } from "./weddingTypes";

// Nilai DEMO — dipakai untuk keperluan testing/preview internal saja
// (bukan untuk akun pembeli sungguhan). Berisi contoh data seperti yang
// dulu tampil di mockup desain awal.
export function demoWeddingState(): WeddingState {
  return {
    theme: "light",
    weddingDate: "2024-10-24",
    coupleProfile: {
      brideName: "Siti Aminah",
      groomName: "Budi Santoso",
      contactEmail: "budi.siti.wedding@example.com",
      contactPhone: "+62 812 3456 7890",
      weddingTitle: "#BudiSitiTiesTheKnot",
      weddingTime: "15:00",
      primaryVenue: "The Grand Estate Ballroom, Jakarta",
    },
    guests: [
      { id: "1", name: "Arthur Abernathy", phone: "+6281234567890", group: "Bride's Family", status: "Confirmed", table: "T-01" },
      { id: "2", name: "Beatrice Sterling", phone: "+6281298765432", group: "Work Colleagues", status: "Pending", table: "Unassigned" },
      { id: "3", name: "Charles Harrington", phone: "+6281112223334", group: "Groom's Friends", status: "Declined", table: "N/A" },
      { id: "4", name: "Diana Astor", phone: "+6281998877665", group: "VIP", status: "Confirmed", table: "T-01" },
      { id: "5", name: "Edward Winslow", phone: "+6281223344556", group: "Groom's Family", status: "Confirmed", table: "T-02" },
      { id: "6", name: "Fiona Marlowe", phone: "+6281334455667", group: "Bride's Family", status: "Confirmed", table: "T-02" },
      { id: "7", name: "George Halloway", phone: "+6281445566778", group: "Work Colleagues", status: "Pending", table: "Unassigned" },
      { id: "8", name: "Helena Ashworth", phone: "+6281556677889", group: "VIP", status: "Confirmed", table: "T-01" },
    ],
    expenses: [
      { id: "1", name: "Grand Ballroom Rental", vendor: "The Ritz-Carlton", total: 25000000, paid: 25000000, status: "Lunas", category: "Venue & Catering" },
      { id: "2", name: "Plated Dinner & Bar", vendor: "Gourmet Luxe Catering", total: 18500000, paid: 9250000, status: "DP", category: "Venue & Catering" },
      { id: "3", name: "Ceremony Arch & Aisles", vendor: "Botanica Atelier", total: 8200000, paid: 2000000, status: "DP", category: "Florals & Decor" },
      { id: "4", name: "Custom Lighting Setup", vendor: "Lumina Events", total: 3500000, paid: 0, status: "Unpaid", category: "Florals & Decor" },
    ],
    requirements: [
      { id: "1", name: "Surat Pengantar RT/RW", desc: "Surat asli dari domisili asal", status: "Selesai", file: "surat_rt_rw.pdf", category: "CPP" },
      { id: "2", name: "Fotokopi KTP, KK, Akta", desc: "Identitas dasar calon pengantin", status: "Proses", file: null, category: "CPP" },
      { id: "3", name: "Ijazah Terakhir", desc: "Fotokopi ijazah pendidikan terakhir", status: "Belum Diunggah", file: null, category: "CPW" },
      { id: "4", name: "Pas Foto 2x3 & 4x6", desc: "Latar belakang biru (4 lembar)", status: "Belum Diunggah", file: null, category: "Joint" },
    ],
    activities: [
      { id: "1", title: "The Shoe Game", category: "Reception", status: "Confirmed", duration: 15, needs: "2 Chairs, Couple's Shoes", desc: "A classic interactive game where the couple answers questions about each other by raising the corresponding shoe." },
      { id: "2", title: "Couple Trivia", category: "Icebreaker", status: "Planning", duration: 20, needs: "Printed Cards, Pens, 12 Prizes", desc: "Guests fill out trivia cards at their tables to see who knows the couple best. Winner per table gets a centerpiece." },
      { id: "3", title: "First Dance & Live Band Set", category: "Reception", status: "Confirmed", duration: 30, needs: "7-Piece Live Band, Dance Floor Lighting", desc: "Opening dance followed by a live set to bring guests to the dance floor." },
    ],
    attireItems: [
      { id: "1", name: "Eleanor V.", role: "Bride", status: "Final Fitting", vendor: "Maison de Blanc", desc: "Custom Ivory Silk Gown", measurements: 'Bust: 34", Waist: 26", Hips: 36", Hollow to Hem: 58"', imageUrl: "https://images.unsplash.com/photo-1596450514735-111a2fe02935?w=200&h=200&fit=crop" },
      { id: "2", name: "James T.", role: "Groom", status: "In Progress", vendor: "Savile Row Bespoke", desc: "Midnight Blue Tuxedo", measurements: 'Chest: 40", Waist: 32", Inseam: 30", Sleeve: 34"', imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop" },
      { id: "3", name: "Sarah C.", role: "Maid of Honor", status: "In Progress", vendor: "Maison de Blanc", desc: "Burgundy Velvet Gown", measurements: 'Bust: 36", Waist: 28", Hips: 38"', imageUrl: "https://images.unsplash.com/photo-1583391733958-d259779e5d6c?w=200&h=200&fit=crop" },
      { id: "4", name: "Vincent V.", role: "Best Man", status: "Not Started", vendor: "Savile Row Bespoke", desc: "Midnight Blue Wool Suit", measurements: 'Chest: 42", Waist: 34", Inseam: 32"', imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop" },
      { id: "5", name: "Helena V.", role: "Mother of the Bride", status: "Final Fitting", vendor: "Maison de Blanc", desc: "Champagne Lace Gown", measurements: 'Bust: 38", Waist: 30"' },
    ],
    attireVendorNotes: [
      { id: "1", vendorName: "Maison de Blanc (Bridal)", notes: "Ensure train is bustled discreetly. Extra lace requested for veil detailing.", dueDate: "2024-10-15" },
      { id: "2", vendorName: "Savile Row Bespoke (Groom)", notes: "Monogram inside jacket pocket: E & J 2024. Cuff break should be minimal.", dueDate: "2024-09-20" },
    ],
    fabricSwatches: [
      { id: "1", name: "Bridesmaid Velvet", imageUrl: "https://images.unsplash.com/photo-1596450514735-111a2fe02935?w=400&h=400&fit=crop" },
      { id: "2", name: "Accent Silk", imageUrl: "https://images.unsplash.com/photo-1583391733958-d259779e5d6c?w=400&h=400&fit=crop" },
      { id: "3", name: "Groomsmen Wool", imageUrl: "https://images.unsplash.com/photo-1612423259837-772eb62a4fa9?w=400&h=400&fit=crop" },
    ],
    logistics: [
      { id: "1", name: "Chiavari Chairs - Gold", category: "Rentals", supplier: "Luxe Event Rentals Co.", cost: 12000000, status: "Confirmed", percent: 9.6 },
      { id: "2", name: "Crystal Centerpieces", category: "Decor", supplier: "Botanica", cost: 8500000, status: "Pending", percent: 6.8 },
      { id: "3", name: "Welcome Gifts", category: "Gifts", supplier: "Artisan Favors", cost: 4500000, status: "Inquiry", percent: 3.6 },
    ],
    tasks: [
      // Venue & Catering
      { id: "t1", categoryId: "cat1", title: "Finalize ballroom contract with The Grand Estate", status: "Completed", assigneeId: "m3", dueDate: "2024-06-15", priority: "High", desc: "Signed contract for full evening use, deposit paid." },
      { id: "t2", categoryId: "cat1", title: "Confirm final headcount with catering team", status: "Completed", assigneeId: "m3", dueDate: "2024-09-20", priority: "High", desc: "Locked plated dinner count at 180 guests." },
      { id: "t3", categoryId: "cat1", title: "Schedule final venue walkthrough", status: "Not Started", assigneeId: "m1", dueDate: "2024-10-10", priority: "Medium", desc: "Walk the full floor plan with the wedding planner two weeks before the big day." },
      // Design & Decor
      { id: "t4", categoryId: "cat2", title: "Approve floral moodboard with Botanica Atelier", status: "Completed", assigneeId: "m2", dueDate: "2024-07-01", priority: "Medium", desc: "Ivory and blush palette approved, sample arrangement confirmed." },
      { id: "t5", categoryId: "cat2", title: "Finalize table centerpiece design", status: "In Progress", assigneeId: "m2", dueDate: "2024-09-05", priority: "Medium", desc: "Comparing crystal vs. botanical centerpiece options for 20 tables." },
      { id: "t6", categoryId: "cat2", title: "Order ceremony arch installation", status: "Not Started", assigneeId: "m3", dueDate: "2024-10-05", priority: "High", desc: "Confirm delivery and setup time with Botanica Atelier crew." },
      // Attire
      { id: "t7", categoryId: "cat3", title: "Bride's final gown fitting", status: "Completed", assigneeId: "m1", dueDate: "2024-09-25", priority: "High", desc: "Final alterations completed at Maison de Blanc." },
      { id: "t8", categoryId: "cat3", title: "Groom's tuxedo alterations", status: "Completed", assigneeId: "m2", dueDate: "2024-09-20", priority: "Medium", desc: "Midnight blue tuxedo tailored, ready for pickup." },
      { id: "t9", categoryId: "cat3", title: "Bridal party attire delivery confirmation", status: "Not Started", assigneeId: "m4", dueDate: "2024-10-08", priority: "Low", desc: "Confirm all bridesmaid and groomsmen outfits arrive on time." },
      // Photo & Video
      { id: "t10", categoryId: "cat4", title: "Book pre-wedding photoshoot session", status: "Completed", assigneeId: "m1", dueDate: "2024-05-10", priority: "Medium", desc: "Golden hour session at the venue gardens, completed and delivered." },
      { id: "t11", categoryId: "cat4", title: "Finalize shot list with photographer", status: "In Progress", assigneeId: "m5", dueDate: "2024-10-01", priority: "High", desc: "Cross-referencing must-have family combinations with the family list." },
      { id: "t12", categoryId: "cat4", title: "Confirm videographer drone permit", status: "On Hold", assigneeId: "m5", dueDate: "2024-09-15", priority: "Low", desc: "Waiting on venue management approval for aerial shots." },
      // Entertainment
      { id: "t13", categoryId: "cat5", title: "Book live band for reception", status: "Completed", assigneeId: "m3", dueDate: "2024-06-01", priority: "Medium", desc: "7-piece band booked, setlist review scheduled." },
      { id: "t14", categoryId: "cat5", title: "Finalize first dance song selection", status: "Not Started", assigneeId: "m1", dueDate: "2024-10-12", priority: "Low", desc: "Still deciding between two favorite songs." },
      { id: "t15", categoryId: "cat5", title: "Confirm MC run-of-show script", status: "In Progress", assigneeId: "m3", dueDate: "2024-10-02", priority: "Medium", desc: "Draft timeline shared with MC for review and timing adjustments." },
      // Logistics
      { id: "t16", categoryId: "cat6", title: "Confirm chair & centerpiece rental delivery schedule", status: "Completed", assigneeId: "m5", dueDate: "2024-08-20", priority: "Medium", desc: "Delivery locked for the morning of the event." },
      { id: "t17", categoryId: "cat6", title: "Arrange guest transportation (Alphard fleet)", status: "In Progress", assigneeId: "m5", dueDate: "2024-10-15", priority: "High", desc: "Coordinating pickup routes for VIP guests and family." },
      { id: "t18", categoryId: "cat6", title: "Book presidential suite for wedding night", status: "Completed", assigneeId: "m1", dueDate: "2024-07-15", priority: "Low", desc: "Reservation confirmed with early check-in at 14:00." },
      // Administration
      { id: "t19", categoryId: "cat7", title: "Submit surat pengantar RT/RW", status: "Completed", assigneeId: "m1", dueDate: "2024-06-10", priority: "High", desc: "Document collected and filed with the marriage registration folder." },
      { id: "t20", categoryId: "cat7", title: "Complete KUA marriage registration documents", status: "Completed", assigneeId: "m2", dueDate: "2024-09-30", priority: "High", desc: "All required documents submitted, awaiting confirmation letter." },
      // Guests & Invitations
      { id: "t21", categoryId: "cat8", title: "Send digital save-the-dates", status: "Completed", assigneeId: "m1", dueDate: "2024-05-01", priority: "Medium", desc: "Sent to all 180 guests via WhatsApp and email." },
      { id: "t22", categoryId: "cat8", title: "Follow up RSVP for pending guests", status: "In Progress", assigneeId: "m1", dueDate: "2024-09-28", priority: "Medium", desc: "Reaching out to guests who haven't responded yet." },
      { id: "t23", categoryId: "cat8", title: "Finalize seating chart", status: "Not Started", assigneeId: "m2", dueDate: "2024-10-14", priority: "High", desc: "Waiting on final RSVP count before locking table assignments." },
      // Budget & Finance
      { id: "t24", categoryId: "cat9", title: "Pay vendor down payments (DP)", status: "Completed", assigneeId: "m2", dueDate: "2024-07-01", priority: "High", desc: "All major vendor deposits paid on schedule." },
      { id: "t25", categoryId: "cat9", title: "Reconcile final catering invoice", status: "In Progress", assigneeId: "m2", dueDate: "2024-10-01", priority: "Medium", desc: "Cross-checking final headcount against the last invoice from Gourmet Luxe." },
    ],
    categories: [
      { id: "cat1", name: "Venue & Catering", icon: "home", colorClass: "text-brand-primary", bgClass: "bg-brand-primary" },
      { id: "cat2", name: "Design & Decor", icon: "palette", colorClass: "text-brand-accent", bgClass: "bg-brand-accent" },
      { id: "cat3", name: "Attire", icon: "shirt", colorClass: "text-brand-success", bgClass: "bg-brand-success" },
      { id: "cat4", name: "Photo & Video", icon: "camera", colorClass: "text-brand-warning", bgClass: "bg-brand-warning" },
      { id: "cat5", name: "Entertainment", icon: "music", colorClass: "text-brand-primary", bgClass: "bg-brand-primary" },
      { id: "cat6", name: "Logistics", icon: "truck", colorClass: "text-brand-accent", bgClass: "bg-brand-accent" },
      { id: "cat7", name: "Administration", icon: "filetext", colorClass: "text-brand-success", bgClass: "bg-brand-success" },
      { id: "cat8", name: "Guests & Invitations", icon: "users", colorClass: "text-brand-warning", bgClass: "bg-brand-warning" },
      { id: "cat9", name: "Budget & Finance", icon: "creditcard", colorClass: "text-brand-primary", bgClass: "bg-brand-primary" },
    ],
    members: [
      { id: "m1", name: "Siti Aminah", initials: "SA", color: "#ffffff", bgColor: "#8b4a52" },
      { id: "m2", name: "Budi Santoso", initials: "BS", color: "#ffffff", bgColor: "#c9a86a" },
      { id: "m3", name: "Rina Wijaya (Wedding Planner)", initials: "RW", color: "#ffffff", bgColor: "#4a6b8b" },
      { id: "m4", name: "Laras Putri (MUA)", initials: "LP", color: "#ffffff", bgColor: "#5a8b4a" },
      { id: "m5", name: "Dimas Pratama (Vendor Coordinator)", initials: "DP", color: "#ffffff", bgColor: "#8b6b4a" },
    ],
    targetGuests: 180,
    totalBudget: 150000000,
    vendors: [
      { id: "1", name: "The Grand Estate", category: "Venue & Catering", status: "BOOKED", totalValue: 43500000, paidValue: 34250000, picName: "Amanda Wells", picPhone: "+628112233445", picEmail: "events@thegrandestate.id", website: "thegrandestate.id", rating: 5, notes: "Ballroom confirmed for the full evening. Final walkthrough scheduled 2 weeks prior." },
      { id: "2", name: "Gourmet Luxe", category: "Venue & Catering", status: "NEGOTIATING", totalValue: 18500000, paidValue: 9250000, picName: "Chef Rian Pratama", picPhone: "+628129988776", picEmail: "hello@gourmetluxe.id", website: "gourmetluxe.id", rating: 4, notes: "Awaiting final headcount to confirm plated dinner pricing tier." },
      { id: "3", name: "Botanica Atelier", category: "Florals & Decor", status: "BOOKED", totalValue: 8200000, paidValue: 2000000, picName: "Nadia Kusuma", picPhone: "+628134455667", picEmail: "studio@botanica-atelier.id", website: "botanica-atelier.id", rating: 5, notes: "Moodboard approved. Mock-up arrangement scheduled one month prior." },
    ],
    rentals: [
      { id: "1", name: "Chiavari Chairs - Gold", vendorId: "1", quantity: 200, arrivalStatus: "Pending", returnStatus: "Pending", notes: "Include velvet cushions" },
      { id: "2", name: "Crystal Centerpieces", vendorId: "2", quantity: 20, arrivalStatus: "Pending", returnStatus: "Pending", notes: "Fragile" },
    ],
    handovers: [
      { id: "1", name: "Wedding Rings", valueDescription: "High Value (Gold & Diamond)", picName: "Best Man (Arthur)", status: "Pending" },
      { id: "2", name: "Dowry (Mahar)", valueDescription: "Cash & Gold", picName: "Bride Brother", status: "Pending" },
    ],
    logisticsTimelines: [
      { id: "1", vendorId: "1", activity: "Decor Loading", startTime: "06:00", endTime: "10:00", type: "Load-In", status: "Pending" },
      { id: "2", vendorId: "2", activity: "Sound Check", startTime: "10:00", endTime: "12:00", type: "Load-In", status: "Pending" },
    ],
    transportStays: [
      { id: "1", type: "Vehicle", name: "Alphard Black", allocation: "VIP / Couple", capacity: "4 Pax", notes: "Standby at 07:00 AM" },
      { id: "2", type: "Accommodation", name: "Presidential Suite", allocation: "Couple", capacity: "2 Pax", notes: "Check-in 14:00" },
    ],
    // Slot tambahan yang dulunya localStorage terpisah di 3 view
    // (PhotoVideo, Entertainment) — sekarang ikut dalam 1 blob ini.
    misc: {
      evervow_shots: [],
      evervow_tech_notes: [],
      evervow_flow_slots: [],
    },
    guestGroups: ["Bride's Family", "Groom's Family", 'Work Colleagues', 'VIP', 'Unassigned'],
  };
}

// State BENAR-BENAR KOSONG — inilah yang dipakai saat akun pembeli baru
// aktivasi lisensi pertama kali. Tidak ada satupun data fiktif, supaya
// setiap pembeli mulai dari halaman putih murni, bukan data pembeli lain
// (walau cuma dummy) yang bisa membingungkan atau terlihat tidak profesional.
export function emptyWeddingState(): WeddingState {
  return {
    theme: 'light',
    weddingDate: '',
    coupleProfile: {
      brideName: '',
      groomName: '',
      contactEmail: '',
      contactPhone: '',
      weddingTitle: '',
      weddingTime: '',
      primaryVenue: '',
    },
    guests: [],
    expenses: [],
    requirements: [],
    activities: [],
    attireItems: [],
    attireVendorNotes: [],
    fabricSwatches: [],
    logistics: [],
    tasks: [],
    categories: [],
    members: [],
    targetGuests: 0,
    totalBudget: 0,
    vendors: [],
    rentals: [],
    handovers: [],
    logisticsTimelines: [],
    transportStays: [],
    misc: {
      evervow_shots: [],
      evervow_tech_notes: [],
      evervow_flow_slots: [],
    },
    // Ini BUKAN data personal — cuma daftar label kategori standar biar
    // dropdown Guest List tidak kosong melompong di hari pertama. Semua
    // tetap bisa diedit/dihapus pembeli lewat Settings > Guest Categories.
    guestGroups: ["Bride's Family", "Groom's Family", 'Work Colleagues', 'VIP', 'Unassigned'],
  };
}
