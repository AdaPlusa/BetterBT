import React from 'react';

const ConfirmModal = ({ show, title, message, onConfirm, onClose }) => {
    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" style={{zIndex: 50}}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{zIndex: 51}}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg animate-scale-up">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold text-dark">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body py-4 text-start">
                            <div className="d-flex align-items-start gap-3">
                                <div className="rounded-circle bg-danger bg-opacity-10 p-3 d-flex align-items-center justify-content-center text-danger">
                                    <i className="bi bi-exclamation-triangle fs-3"></i>
                                </div>
                                <div className="mt-1">
                                    <h5 className="fw-bold mb-1">{title}</h5>
                                    <p className="text-secondary mb-0">{message}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light fw-bold text-secondary" onClick={onClose}>
                                Anuluj
                            </button>
                            <button type="button" className="btn btn-danger fw-bold px-4" onClick={onConfirm}>
                                Usuń
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmModal;
