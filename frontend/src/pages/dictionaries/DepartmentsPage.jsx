import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            alert('Błąd pobierania danych');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/departments', { name });
            setName('');
            loadData();
            alert('Dodano dział!');
        } catch (err) {
            alert('Błąd dodawania');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary fw-bold">Słownik: Działy Firmy</h2>

            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0 p-4">
                        <h5 className="mb-3">Dodaj Nowy Dział</h5>
                        <form onSubmit={handleAdd}>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Nazwa Działu</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required
                                    placeholder="np. IT, HR, Marketing"
                                />
                            </div>
                            <button className="btn btn-primary w-100 fw-bold">Dodaj</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 text-secondary">Lista Działów</h5>
                        </div>
                        <table className="table table-hover mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th className="w-100">Nazwa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d.id}>
                                        <td className="ps-4 fw-bold">#{d.id}</td>
                                        <td>{d.name}</td>
                                    </tr>
                                ))}
                                {departments.length === 0 && <tr><td colSpan="2" className="text-muted text-center py-4">Brak danych</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentsPage;
