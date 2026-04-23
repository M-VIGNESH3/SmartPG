import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ icon, title, description, actionLabel, onAction }) => {
  const Icon = icon || FiInbox;
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 bg-blue-50 rounded-full text-blue-500 mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
