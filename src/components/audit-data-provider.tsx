import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoData, STORAGE_KEY, type AuditData } from "@/lib/audit-data";

type AuditDataContextValue = {
  data: AuditData;
  updateData: (updater: (current: AuditData) => AuditData) => void;
  resetDemo: () => void;
};

const AuditDataContext = createContext<AuditDataContextValue | null>(null);

export function AuditDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AuditData>(demoData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved) as AuditData);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  const value = useMemo(
    () => ({
      data,
      updateData: (updater: (current: AuditData) => AuditData) => setData(updater),
      resetDemo: () => setData(demoData),
    }),
    [data],
  );

  return <AuditDataContext.Provider value={value}>{children}</AuditDataContext.Provider>;
}

export function useAuditData() {
  const context = useContext(AuditDataContext);
  if (!context) throw new Error("useAuditData must be used within AuditDataProvider");
  return context;
}
