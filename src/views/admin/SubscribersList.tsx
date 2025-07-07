import React from 'react';

interface SubscribersListProps {
  open: boolean;
  onClose: () => void;
  subscribers: Array<{ id: string; name: string; email: string }>;
}

const SubscribersList: React.FC<SubscribersListProps> = ({ open, onClose, subscribers }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Subscribers</h2>
          <ul className="divide-y divide-gray-200">
            {subscribers.map(sub => (
              <li key={sub.id} className="py-2">
                <div className="font-medium">{sub.name}</div>
                <div className="text-sm text-gray-500">{sub.email}</div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="btn-outline">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribersList;
