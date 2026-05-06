import { useUIStore } from '@/store/uiStore';

export function useConfirm() {
  const { openModal, closeModal } = useUIStore();

  const confirm = ({ 
    title = 'Are you sure?', 
    message, 
    onConfirm, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    variant = 'primary'
  }: {
    title?: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'destructive';
  }) => {
    openModal({
      title,
      content: <p className="text-sm text-muted-foreground">{message}</p>,
      footer: (
        <>
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              closeModal();
            }}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all active:scale-95 ${
              variant === 'destructive' 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </>
      )
    });
  };

  return confirm;
}
