import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminTemplatesPage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.get('/templates/PDF_FOOTER')
           .then(res => {
               setContent(res.data.content || '');
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, []);

    const handleSave = () => {
        api.put('/templates/PDF_FOOTER', { content })
           .then(() => {
               setMessage('Zapisano pomyślnie!');
               setTimeout(() => setMessage(''), 3000);
           })
           .catch(() => setMessage('Błąd zapisu.'));
    };

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;

    return (
        <div className="container mt-4">
            <h2 className="fw-bold mb-4">Szablony Dokumentów (Wydruków)</h2>
            
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-bold text-primary">Stopka PDF (Szablon)</h5>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label text-muted">Treść stopki pojawiająca się na każdym wygenerowanym PDF:</label>
                        <textarea 
                            className="form-control" 
                            rows="4" 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>
                    
                    {message && (
                        <div className={`alert alert-${message.includes('Błąd') ? 'danger' : 'success'} py-2`}>
                            {message}
                        </div>
                    )}

                    <button className="btn btn-primary" onClick={handleSave}>
                        <i className="bi bi-save me-2"></i> Zapisz Zmiany
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTemplatesPage;
