import React from 'react';

const ConfirmModal = ({ 
    show, 
    title, 
    message, 
    onConfirm, 
    onClose, 
    variant = 'danger', // 'danger' | 'success' | 'warning' | 'info'
    confirmLabel = 'Usuń',
    icon = 'bi-exclamation-triangle',
    children
}) => {
    if (!show) return null;

    const getVariantClasses = () => {
        switch (variant) {
            case 'success': return { bg: 'bg-success', text: 'text-success', btn: 'btn-success' };
            case 'warning': return { bg: 'bg-warning', text: 'text-warning', btn: 'btn-warning text-dark' };
            case 'info':    return { bg: 'bg-info',    text: 'text-info',    btn: 'btn-info text-white' };
            default:        return { bg: 'bg-danger',  text: 'text-danger',  btn: 'btn-danger' };
        }
    };

    const styles = getVariantClasses();

    return (
        <>
            <div className="modal-backdrop fade show" style={{zIndex: 1050}}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{zIndex: 1055}}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg animate-scale-up">
                        <div className={`modal-header border-0 pb-0`}>
                            <h5 className="modal-title fw-bold text-dark">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body py-4 text-start">
                            <div className="d-flex align-items-start gap-3">
                                <div className={`rounded-circle ${styles.bg} bg-opacity-10 p-3 d-flex align-items-center justify-content-center ${styles.text}`}>
                                    <i className={`bi ${icon} fs-3`}></i>
                                </div>
                                <div className="mt-1 w-100">
                                    <h5 className="fw-bold mb-1">{title}</h5>
                                    {message && <p className="text-secondary mb-0">{message}</p>}
                                    {children && <div className="mt-3">{children}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light fw-bold text-secondary" onClick={onClose}>
                                Anuluj
                            </button>
                            <button type="button" className={`btn ${styles.btn} fw-bold px-4`} onClick={onConfirm}>
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmModal;
