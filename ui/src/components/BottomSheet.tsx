import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto md:hidden">
        <div className="sticky top-0 bg-white p-4 border-b border-slate-200 flex justify-center">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <ChevronDown className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}
