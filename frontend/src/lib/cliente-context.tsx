import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { fetchContas, type Conta } from "@/lib/skill-client";

type ClienteContextType = {
  contas: Conta[];
  cliente: string;
  setCliente: (c: string) => void;
};

const ClienteContext = createContext<ClienteContextType>({
  contas: [],
  cliente: "",
  setCliente: () => {},
});

export function ClienteProvider({ children }: { children: ReactNode }) {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");

  useEffect(() => {
    fetchContas().then((cs) => {
      setContas(cs);
      if (cs[0]) setCliente(cs[0].cliente);
    }).catch(() => {});
  }, []);

  return (
    <ClienteContext.Provider value={{ contas, cliente, setCliente }}>
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  return useContext(ClienteContext);
}
