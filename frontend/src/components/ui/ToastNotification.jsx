import React from 'react';

const ToastNotification = ({ message, type, onClose }) => {
    const bgClass = type === 'error' ? 'bg-danger' : 'bg-success';
    const icon = type === 'error' ? 'bi-exclamation-octagon' : 'bi-check-circle';

    return (
        <div className={`toast show align-items-center text-white ${bgClass} border-0 mb-2 shadow`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
                <div className="toast-body d-flex align-items-center gap-2">
                    <i className={`bi ${icon} fs-5`}></i>
                    <span className="fw-medium">{message}</span>
                </div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose} aria-label="Close"></button>
            </div>
        </div>
    );
};

export default ToastNotification;
