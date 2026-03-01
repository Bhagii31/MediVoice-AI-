import { createContext, useContext, useState, useEffect } from "react";

type PharmacyContextType = {
  pharmacyId: string | null;
  pharmacyName: string | null;
  setPharmacy: (id: string, name: string) => void;
  clearPharmacy: () => void;
};

const PharmacyContext = createContext<PharmacyContextType>({
  pharmacyId: null,
  pharmacyName: null,
  setPharmacy: () => {},
  clearPharmacy: () => {},
});

export function PharmacyProvider({ children }: { children: React.ReactNode }) {
  const [pharmacyId, setPharmacyId] = useState<string | null>(
    () => localStorage.getItem("pharmacy_id")
  );
  const [pharmacyName, setPharmacyName] = useState<string | null>(
    () => localStorage.getItem("pharmacy_name")
  );

  const setPharmacy = (id: string, name: string) => {
    localStorage.setItem("pharmacy_id", id);
    localStorage.setItem("pharmacy_name", name);
    setPharmacyId(id);
    setPharmacyName(name);
  };

  const clearPharmacy = () => {
    localStorage.removeItem("pharmacy_id");
    localStorage.removeItem("pharmacy_name");
    setPharmacyId(null);
    setPharmacyName(null);
  };

  return (
    <PharmacyContext.Provider value={{ pharmacyId, pharmacyName, setPharmacy, clearPharmacy }}>
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacyContext() {
  return useContext(PharmacyContext);
}
