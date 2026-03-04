import { useEffect } from 'react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineInfoCircle } from 'react-icons/ai';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <AiOutlineCheckCircle className="text-green-500" size={24} />,
    error: <AiOutlineCloseCircle className="text-red-500" size={24} />,
    info: <AiOutlineInfoCircle className="text-blue-500" size={24} />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="text-sm font-medium text-gray-800">{message}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        ✕
      </button>
    </div>
  );
};

export default Toast;
