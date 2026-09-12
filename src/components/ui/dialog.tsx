import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-ink/40" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded border border-line bg-paper p-5"
          )}
        >
          <DialogPrimitive.Title className="font-display text-lg font-bold tracking-tight">
            {title}
          </DialogPrimitive.Title>
          <div className="mt-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
