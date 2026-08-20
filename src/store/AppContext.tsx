"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from "react";
import { emptyWeddingState, demoWeddingState } from "@/lib/defaultState";
import type { TutorialLang } from "@/lib/tutorialCopy";
import type { WeddingState, Guest, Expense, Requirement, Activity, LogisticItem, Member, Category, Vendor, RentalItem, HandoverItem, LogisticsTimeline, TransportStay, FabricSwatch, AttireVendorNote, AttireItem, Task, CoupleProfile } from "@/lib/weddingTypes";

export type { Guest, Expense, Requirement, Activity, LogisticItem, Member, Category, Vendor, RentalItem, HandoverItem, LogisticsTimeline, TransportStay, FabricSwatch, AttireVendorNote, AttireItem, Task };


interface AppState {
  loading: boolean;
  theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void;
  weddingDate: string; setWeddingDate: (d: string) => void;
  coupleProfile: CoupleProfile; setCoupleProfile: (p: CoupleProfile) => void;
  guests: Guest[]; addGuest: (g: Guest) => void; deleteGuest: (id: string) => void; editGuest: (g: Guest) => void;
  expenses: Expense[]; addExpense: (e: Expense) => void; deleteExpense: (id: string) => void; editExpense: (e: Expense) => void;
  requirements: Requirement[]; addRequirement: (r: Requirement) => void; deleteRequirement: (id: string) => void; editRequirement: (r: Requirement) => void;
  activities: Activity[]; addActivity: (a: Activity) => void; deleteActivity: (id: string) => void; editActivity: (a: Activity) => void;
  attireItems: AttireItem[]; addAttireItem: (i: AttireItem) => void; deleteAttireItem: (id: string) => void; editAttireItem: (i: AttireItem) => void;
  attireVendorNotes: AttireVendorNote[]; addAttireVendorNote: (n: AttireVendorNote) => void; deleteAttireVendorNote: (id: string) => void; editAttireVendorNote: (n: AttireVendorNote) => void;
  fabricSwatches: FabricSwatch[]; addFabricSwatch: (f: FabricSwatch) => void; deleteFabricSwatch: (id: string) => void;
  logistics: LogisticItem[]; addLogisticItem: (i: LogisticItem) => void; deleteLogisticItem: (id: string) => void; editLogisticItem: (i: LogisticItem) => void;
  tasks: Task[]; addTask: (t: Task) => void; deleteTask: (id: string) => void; editTask: (t: Task) => void; setTasks: (t: Task[]) => void;
  categories: Category[]; addCategory: (c: Category) => void; setCategories: (c: Category[]) => void;
  members: Member[]; addMember: (m: Member) => void; setMembers: (m: Member[]) => void;
  targetGuests: number; setTargetGuests: (n: number) => void;
  guestGroups: string[]; setGuestGroups: (g: string[]) => void;
  totalBudget: number; setTotalBudget: (n: number) => void;
  vendors: Vendor[]; addVendor: (v: Vendor) => void; editVendor: (v: Vendor) => void; deleteVendor: (id: string) => void;
  rentals: RentalItem[]; addRental: (r: RentalItem) => void; editRental: (r: RentalItem) => void;
  handovers: HandoverItem[]; addHandover: (h: HandoverItem) => void; editHandover: (h: HandoverItem) => void;
  logisticsTimelines: LogisticsTimeline[]; addLogisticsTimeline: (l: LogisticsTimeline) => void; editLogisticsTimeline: (l: LogisticsTimeline) => void;
  transportStays: TransportStay[]; addTransportStay: (t: TransportStay) => void; editTransportStay: (t: TransportStay) => void;
  currentView: string; setCurrentView: (v: string) => void;
  username: string;
  // Kompatibilitas untuk 3 slot yang dulu localStorage langsung di PhotoVideo/Entertainment:
  misc: Record<string, any>; setMiscItem: (key: string, value: any) => void;

  // ------- Getting Started / Tutorial mode -------
  // Saat isTutorialMode true, SEMUA field data di atas (guests, expenses,
  // vendors, dst.) sedang menampilkan dummyData (read-only sandbox) —
  // BUKAN data asli user. realData tetap utuh di state internal dan tidak
  // pernah tertimpa maupun tercampur oleh dummyData.
  isTutorialMode: boolean;
  tutorialTrigger: "first-time" | "replay" | null;
  hasSeenTutorial: boolean;
  enterTutorial: (trigger?: "first-time" | "replay") => void;
  exitTutorial: () => void;
  tutorialLang: TutorialLang;
  setTutorialLang: (lang: TutorialLang) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeddingState>(emptyWeddingState());
  const [currentView, setCurrentView] = useState("dashboard");
  const [username, setUsername] = useState("");
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [tutorialTrigger, setTutorialTrigger] = useState<"first-time" | "replay" | null>(null);
  // dummyData dibuat SEKALI saja dan tidak pernah berubah — dia bukan bagian
  // dari `data`/`setData`, sehingga tidak mungkin termutasi oleh fungsi CRUD
  // manapun. Ini defense-in-depth di atas guard `update()` di bawah.
  const dummyData = useMemo(() => demoWeddingState(), []);

  // Ambil state awal dari server (NeonDB) saat pertama kali render.
  useEffect(() => {
    fetch("/api/state")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data");
        return res.json();
      })
      .then((json) => {
        const mergedState = { ...emptyWeddingState(), ...json.state };
        setData(mergedState);
        setUsername(json.username || "");
        hydrated.current = true;
        setLoading(false);

        // Getting Started otomatis tampil HANYA untuk akun yang belum pernah
        // menuntaskan/menutup tutorial (misc.tutorialSeenAt kosong). Dicek
        // dari data REAL yang baru saja di-fetch dari NeonDB — bukan dummy —
        // supaya user lama yang sudah punya data asli tidak pernah
        // ke-interupsi lagi di kunjungan berikutnya.
        if (!mergedState.misc?.tutorialSeenAt) {
          setTutorialTrigger("first-time");
          setIsTutorialMode(true);
        }
      })
      .catch(() => {
        // Jika gagal (mis. belum login), biarkan middleware yang redirect.
        setLoading(false);
      });
  }, []);

  // Simpan ke server setiap ada perubahan, di-debounce 800ms supaya
  // hemat write ke Neon walau banyak perubahan beruntun.
  useEffect(() => {
    if (!hydrated.current) return; // jangan save sebelum data awal masuk
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: data }),
      }).catch(() => {
        // Kegagalan simpan tidak memutus UI; bisa ditambah toast di sini.
      });
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data]);

  useEffect(() => {
    if (data.theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [data.theme]);

  // TITIK GUARD TUNGGAL: semua fungsi CRUD di bawah (addGuest, updateBudget,
  // editVendor, dst.) selalu lewat update(). Dengan guard di sini saja, kita
  // menjamin: selama isTutorialMode aktif, TIDAK ADA satupun interaksi user
  // yang bisa menyentuh realData. dummyData yang sedang ditampilkan murni
  // read-only sandbox — realData disembunyikan sementara, bukan dihapus.
  const update = (patch: (s: WeddingState) => WeddingState) => {
    if (isTutorialMode) return;
    setData((s) => patch(s));
  };

  // activeData: sumber tunggal yang dibaca oleh seluruh `value` di bawah.
  // Ini murni computed value (bukan state terpisah) — jadi tidak mungkin
  // dummyData dan realData "nyampur", karena keduanya tidak pernah ditulis
  // ke variabel yang sama.
  const activeData = isTutorialMode ? dummyData : data;

  const enterTutorial = (trigger: "first-time" | "replay" = "replay") => {
    setTutorialTrigger(trigger);
    setIsTutorialMode(true);
  };

  const exitTutorial = () => {
    setIsTutorialMode(false);
    setTutorialTrigger(null);
    // Tandai sudah pernah dilihat — hanya ditulis kalau BELUM ada, supaya
    // replay berulang kali dari Settings tidak terus menimpa timestamp asli.
    // Ini setData langsung (bukan lewat update()) karena flag ini adalah
    // metadata tutorial, bukan konten wedding yang perlu di-guard.
    setData((s) =>
      s.misc?.tutorialSeenAt
        ? s
        : { ...s, misc: { ...s.misc, tutorialSeenAt: new Date().toISOString() } }
    );
  };

  const tutorialLang: TutorialLang = data.misc?.tutorialLang === "en" ? "en" : "id";
  const setTutorialLang = (lang: TutorialLang) => {
    // Preferensi bahasa tur murni pengaturan UI, bukan konten wedding —
    // sengaja lewat setData langsung supaya tetap bisa diganti walau
    // isTutorialMode sedang aktif (user boleh switch bahasa saat touring).
    setData((s) => ({ ...s, misc: { ...s.misc, tutorialLang: lang } }));
  };

  const value: AppState = {
    loading,
    theme: data.theme, setTheme: (t) => update((s) => ({ ...s, theme: t })),
    weddingDate: activeData.weddingDate, setWeddingDate: (d) => update((s) => ({ ...s, weddingDate: d })),
    coupleProfile: activeData.coupleProfile, setCoupleProfile: (p) => update((s) => ({ ...s, coupleProfile: p })),

    guests: activeData.guests,
    addGuest: (g) => update((s) => ({ ...s, guests: [...s.guests, g] })),
    deleteGuest: (id) => update((s) => ({ ...s, guests: s.guests.filter((x) => x.id !== id) })),
    editGuest: (g) => update((s) => ({ ...s, guests: s.guests.map((x) => (x.id === g.id ? g : x)) })),

    expenses: activeData.expenses,
    addExpense: (e) => update((s) => ({ ...s, expenses: [...s.expenses, e] })),
    deleteExpense: (id) => update((s) => ({ ...s, expenses: s.expenses.filter((x) => x.id !== id) })),
    editExpense: (e) => update((s) => ({ ...s, expenses: s.expenses.map((x) => (x.id === e.id ? e : x)) })),

    requirements: activeData.requirements,
    addRequirement: (r) => update((s) => ({ ...s, requirements: [...s.requirements, r] })),
    deleteRequirement: (id) => update((s) => ({ ...s, requirements: s.requirements.filter((x) => x.id !== id) })),
    editRequirement: (r) => update((s) => ({ ...s, requirements: s.requirements.map((x) => (x.id === r.id ? r : x)) })),

    activities: activeData.activities,
    addActivity: (a) => update((s) => ({ ...s, activities: [...s.activities, a] })),
    deleteActivity: (id) => update((s) => ({ ...s, activities: s.activities.filter((x) => x.id !== id) })),
    editActivity: (a) => update((s) => ({ ...s, activities: s.activities.map((x) => (x.id === a.id ? a : x)) })),

    attireItems: activeData.attireItems,
    addAttireItem: (i) => update((s) => ({ ...s, attireItems: [...s.attireItems, i] })),
    deleteAttireItem: (id) => update((s) => ({ ...s, attireItems: s.attireItems.filter((x) => x.id !== id) })),
    editAttireItem: (i) => update((s) => ({ ...s, attireItems: s.attireItems.map((x) => (x.id === i.id ? i : x)) })),

    attireVendorNotes: activeData.attireVendorNotes,
    addAttireVendorNote: (n) => update((s) => ({ ...s, attireVendorNotes: [...s.attireVendorNotes, n] })),
    deleteAttireVendorNote: (id) => update((s) => ({ ...s, attireVendorNotes: s.attireVendorNotes.filter((x) => x.id !== id) })),
    editAttireVendorNote: (n) => update((s) => ({ ...s, attireVendorNotes: s.attireVendorNotes.map((x) => (x.id === n.id ? n : x)) })),

    fabricSwatches: activeData.fabricSwatches,
    addFabricSwatch: (f) => update((s) => ({ ...s, fabricSwatches: [...s.fabricSwatches, f] })),
    deleteFabricSwatch: (id) => update((s) => ({ ...s, fabricSwatches: s.fabricSwatches.filter((x) => x.id !== id) })),

    logistics: activeData.logistics,
    addLogisticItem: (i) => update((s) => ({ ...s, logistics: [...s.logistics, i] })),
    deleteLogisticItem: (id) => update((s) => ({ ...s, logistics: s.logistics.filter((x) => x.id !== id) })),
    editLogisticItem: (i) => update((s) => ({ ...s, logistics: s.logistics.map((x) => (x.id === i.id ? i : x)) })),

    tasks: activeData.tasks,
    addTask: (t) => update((s) => ({ ...s, tasks: [...s.tasks, t] })),
    deleteTask: (id) => update((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })),
    editTask: (t) => update((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === t.id ? t : x)) })),
    setTasks: (t) => update((s) => ({ ...s, tasks: t })),

    categories: activeData.categories,
    addCategory: (c) => update((s) => ({ ...s, categories: [...s.categories, c] })),
    setCategories: (c) => update((s) => ({ ...s, categories: c })),

    members: activeData.members,
    addMember: (m) => update((s) => ({ ...s, members: [...s.members, m] })),
    setMembers: (m) => update((s) => ({ ...s, members: m })),

    targetGuests: activeData.targetGuests, setTargetGuests: (n) => update((s) => ({ ...s, targetGuests: n })),
    guestGroups: activeData.guestGroups, setGuestGroups: (g) => update((s) => ({ ...s, guestGroups: g })),
    totalBudget: activeData.totalBudget, setTotalBudget: (n) => update((s) => ({ ...s, totalBudget: n })),

    vendors: activeData.vendors,
    addVendor: (v) => update((s) => ({ ...s, vendors: [...s.vendors, v] })),
    editVendor: (v) => update((s) => ({ ...s, vendors: s.vendors.map((x) => (x.id === v.id ? v : x)) })),
    deleteVendor: (id) => update((s) => ({ ...s, vendors: s.vendors.filter((x) => x.id !== id) })),

    rentals: activeData.rentals,
    addRental: (r) => update((s) => ({ ...s, rentals: [...s.rentals, r] })),
    editRental: (r) => update((s) => ({ ...s, rentals: s.rentals.map((x) => (x.id === r.id ? r : x)) })),

    handovers: activeData.handovers,
    addHandover: (h) => update((s) => ({ ...s, handovers: [...s.handovers, h] })),
    editHandover: (h) => update((s) => ({ ...s, handovers: s.handovers.map((x) => (x.id === h.id ? h : x)) })),

    logisticsTimelines: activeData.logisticsTimelines,
    addLogisticsTimeline: (l) => update((s) => ({ ...s, logisticsTimelines: [...s.logisticsTimelines, l] })),
    editLogisticsTimeline: (l) => update((s) => ({ ...s, logisticsTimelines: s.logisticsTimelines.map((x) => (x.id === l.id ? l : x)) })),

    transportStays: activeData.transportStays,
    addTransportStay: (t) => update((s) => ({ ...s, transportStays: [...s.transportStays, t] })),
    editTransportStay: (t) => update((s) => ({ ...s, transportStays: s.transportStays.map((x) => (x.id === t.id ? t : x)) })),

    currentView, setCurrentView,
    username,

    misc: activeData.misc,
    setMiscItem: (key, val) => update((s) => ({ ...s, misc: { ...s.misc, [key]: val } })),

    isTutorialMode,
    tutorialTrigger,
    hasSeenTutorial: !!data.misc?.tutorialSeenAt,
    enterTutorial,
    exitTutorial,
    tutorialLang,
    setTutorialLang,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within an AppProvider");
  return ctx;
};
