import { useCallback, useState } from "react";
import { Text } from "react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

interface CartSwitchAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CartSwitchAlert({
  isOpen,
  onOpenChange,
  onConfirm,
}: CartSwitchAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Switch Restaurant?</AlertDialogTitle>
          <AlertDialogDescription>
            Your cart contains items from another restaurant. Adding this item
            will clear your current cart.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            <Text>Continue</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for imperative usage (optional but cleaner)
export function useCartSwitchAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const show = useCallback((onConfirm: () => void) => {
    setPendingAction(() => onConfirm);
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) setPendingAction(null);
  }, []);

  return {
    show,
    AlertComponent: (
      <CartSwitchAlert
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
      />
    ),
  };
}
