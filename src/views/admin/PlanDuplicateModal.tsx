import React from 'react';

interface PlanDuplicateModalProps {
  open: boolean;
  plan: any;
  onClose: () => void;
  onDuplicate: (plan: any) => void;
}

const PlanDuplicateModal: React.FC<PlanDuplicateModalProps> = ({ open, plan, onClose, onDuplicate }) => {
  if (!open || !plan) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Duplicate Plan</h2>
          {/* Duplicate plan form fields here */}
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="btn-outline">Cancel</button>
            <button onClick={() => onDuplicate(plan)} className="btn-primary">Duplicate</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDuplicateModal;
