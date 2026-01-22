import { createContext, useState, useContext, useCallback } from 'react';
import ToastNotification from '../components/ui/ToastNotification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify: addToast }}>
            {children}
            <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                {toasts.map(toast => (
                    <ToastNotification 
                        key={toast.id} 
                        message={toast.message} 
                        type={toast.type}
                        onClose={() => removeToast(toast.id)} 
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
