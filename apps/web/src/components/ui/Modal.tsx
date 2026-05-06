import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function GlobalModal() {
  const { modal, closeModal } = useUIStore();

  return (
    <Dialog.Root open={modal.isOpen} onOpenChange={(open) => !open && closeModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border shadow-2xl rounded-xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200 focus:outline-none">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <Dialog.Title className="text-lg font-bold tracking-tight">
              {modal.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="p-6">
            {modal.content}
          </div>

          {modal.footer && (
            <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
              {modal.footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
