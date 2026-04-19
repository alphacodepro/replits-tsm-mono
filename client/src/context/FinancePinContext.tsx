import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { financePinApi } from "@/lib/api";
import FinancePinDialog from "@/components/FinancePinDialog";

interface FinancePinContextType {
  financeUnlocked: boolean;
  pinIsSet: boolean;
  openPinDialog: () => void;
  lockFinance: () => void;
  onPinSet: () => void;
}

const FinancePinContext = createContext<FinancePinContextType>({
  financeUnlocked: false,
  pinIsSet: false,
  openPinDialog: () => {},
  lockFinance: () => {},
  onPinSet: () => {},
});

export function useFinancePin() {
  return useContext(FinancePinContext);
}

interface FinancePinProviderProps {
  children: ReactNode;
  isTeacher: boolean;
}

export function FinancePinProvider({ children, isTeacher }: FinancePinProviderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [financeUnlocked, setFinanceUnlocked] = useState(false);

  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/finance-pin/status"],
    queryFn: () => financePinApi.status(),
    enabled: isTeacher,
  });

  const pinIsSet = statusData?.isSet ?? false;

  const openPinDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const lockFinance = useCallback(() => {
    setFinanceUnlocked(false);
  }, []);

  const onPinSet = useCallback(() => {
    refetchStatus();
    setFinanceUnlocked(false);
  }, [refetchStatus]);

  return (
    <FinancePinContext.Provider
      value={{ financeUnlocked, pinIsSet, openPinDialog, lockFinance, onPinSet }}
    >
      {children}
      {isTeacher && (
        <FinancePinDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          pinIsSet={pinIsSet}
          onUnlocked={() => {
            setFinanceUnlocked(true);
            setDialogOpen(false);
          }}
          onPinSet={() => {
            onPinSet();
            setDialogOpen(false);
          }}
        />
      )}
    </FinancePinContext.Provider>
  );
}
