import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const SettlementPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    // State for expenses
    const [expenses, setExpenses] = useState([]);
    
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        payer: 'employee', // Default: Pracownik płacił ze swoich
        file: null,
        filePreview: null
    });

    useEffect(() => {
        api.get(`/trips/${id}`)
           .then(res => {
               setTrip(res.data);
               initializeExpenses(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, [id]);

    const initializeExpenses = (data) => {
        const initialItems = [];
        
        // 1. Hotel (Paid by Employer usually, assuming booked via system)
        if (data.hotel) {
            // Recalculate cost based on days if days > 1
            const days = Math.ceil((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            const hotelCost = data.hotel.price ? parseFloat(data.hotel.price) * days : 0; // Fix: Price * Days

            initialItems.push({
                id: 'hotel',
                description: `Hotel: ${data.hotel.name} (${days} dni)`,
                planned: hotelCost,
                actual: hotelCost, // Default to planned
                payer: 'employer',
                isSystem: true,     // Cannot delete
                isReadOnly: false   // Can edit amount
            });
        }
        
        // 2. Transport (Paid by Employer usually)
        if (data.transportRoute) {
            initialItems.push({
                id: 'transport',
                description: `Transport: ${data.transportRoute.provider?.name}`,
                planned: parseFloat(data.transportRoute.price),
                actual: parseFloat(data.transportRoute.price),
                payer: 'employer',
                isSystem: true,
                isReadOnly: false
            });
        }
        
        // 3. Per Diem
        const days = Math.ceil((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        const perDiem = days * 45; // Default rate
        initialItems.push({
            id: 'diety',
            description: `Diety (${days} dni)`,
            planned: perDiem,
            actual: perDiem,
            payer: 'employer', // Technically allowance from employer
            isSystem: true,    // Cannot delete
            isReadOnly: true,  // Cannot edit (Locked)
            isDieta: true      // Flag to identify for calc
        });
         
        setExpenses(initialItems);
    };

    const handleActualChange = (index, value) => {
        const newExpenses = [...expenses];
        newExpenses[index].actual = parseFloat(value) || 0;
        setExpenses(newExpenses);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewExpense({
                ...newExpense,
                file: file,
                filePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleAddExpense = () => {
        if (!newExpense.description || !newExpense.amount) {
            alert("Wypełnij opis i kwotę!");
            return;
        }

        setExpenses([
            ...expenses, 
            { 
                id: Date.now(), 
                description: newExpense.description, 
                planned: 0, 
                actual: parseFloat(newExpense.amount), 
                payer: newExpense.payer,
                file: newExpense.file,
                filePreview: newExpense.filePreview,
                isSystem: false,    // Can delete
                isReadOnly: false   // Can edit
            }
        ]);
        
        // Reset and close
        setNewExpense({ description: '', amount: '', payer: 'employee', file: null, filePreview: null });
        setShowModal(false);
    };

    const removeExpense = (index) => {
        setExpenses(expenses.filter((_, i) => i !== index));
    };

    // Calculate Totals
    const totalActual = expenses.reduce((sum, item) => sum + item.actual, 0);
    
    // To Return = Dieta + (Expenses paid by Employee)
    const toReturn = expenses.reduce((sum, item) => {
        if (item.isDieta) return sum + item.actual; 
        if (item.payer === 'employee') return sum + item.actual; 
        return sum; 
    }, 0);

    const handleSubmit = async () => {
        if (!window.confirm("Czy na pewno chcesz wysłać rozliczenie?")) return;
        
        try {
            const processedItems = await Promise.all(expenses.map(async (e) => {
                let fileData = null;
                if (e.file) {
                    fileData = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(e.file);
                    });
                }

                return {
                    description: `${e.payer === 'employee' ? '[Pracownik]' : '[Firma]'} ${e.description}`,
                    amount: e.actual,
                    fileData: fileData
                };
            }));

            await api.post(`/trips/${id}/settlement`, {
                items: processedItems,
                totalAmount: totalActual
            });
            alert("Wysłano do rozliczenia!");
            navigate('/my-trips');
        } catch (error) {
            console.error(error);
            alert(`Błąd wysyłania: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;

    return (
        <div className="container mt-4 mb-5">
            <h2 className="fw-bold mb-4">Rozlicz Delegację #{trip.id}</h2>
            
            <div className="row g-4 align-items-stretch">
                {/* Left Column: Planned */}
                <div className="col-md-5 d-flex">
                    <div className="card bg-light border-0 shadow-sm w-100">
                        <div className="card-header bg-transparent border-0 fw-bold text-uppercase text-muted">
                            Koszty Planowane
                        </div>
                        <div className="card-body">
                            {expenses.map(item => (
                                item.planned > 0 && (
                                    <div key={item.id} className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                        <span className="text-muted">{item.description}</span>
                                        <span className="fw-bold">{item.planned.toFixed(2)} PLN</span>
                                    </div>
                                )
                            ))}
                            <div className="mt-4 pt-3 border-top d-flex justify-content-between">
                                <span className="fw-bold">SUMA PLANOWANA</span>
                                <span className="fw-bold text-primary">
                                    {expenses.reduce((sum, item) => sum + item.planned, 0).toFixed(2)} PLN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actual */}
                <div className="col-md-7 d-flex">
                    <div className="card border-0 shadow-lg w-100">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-primary">Rzeczywiste Koszty</h5>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                                <i className="bi bi-plus-lg me-1"></i> Dodaj Koszt
                            </button>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Opis</th>
                                            <th>Płatnik</th>
                                            <th>Kwota (PLN)</th>
                                            <th>Zał.</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{item.description}</td>
                                                <td>
                                                    {item.isDieta ? (
                                                        <span className="badge bg-secondary">Pracodawca</span>
                                                    ) : (
                                                        <span className={`badge ${item.payer === 'employee' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                                            {item.payer === 'employee' ? 'Pracownik' : 'Firma'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{width: '140px'}}>
                                                    <input 
                                                        type="number" 
                                                        className="form-control fw-bold" 
                                                        value={item.actual}
                                                        onChange={(e) => handleActualChange(index, e.target.value)}
                                                        disabled={item.isReadOnly} 
                                                    />
                                                </td>
                                                <td>
                                                    {item.filePreview && (
                                                        <a href={item.filePreview} target="_blank" rel="noreferrer" className="text-primary">
                                                            <i className="bi bi-file-earmark-image h5"></i>
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    {!item.isSystem && (
                                                        <button 
                                                            className="btn btn-sm btn-link text-danger"
                                                            onClick={() => removeExpense(index)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Box */}
                            <div className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded border text-center">
                                        <small className="text-uppercase text-muted fw-bold">Całkowity Koszt</small>
                                        <h3 className="fw-bold mb-0 text-dark">{totalActual.toFixed(2)} PLN</h3>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 rounded border text-center text-dark" style={{background: '#d4edda'}}>
                                        <small className="text-uppercase fw-bold opacity-75">Do Zwrotu Pracownikowi</small>
                                        <h3 className="fw-bold mb-0 text-success">{toReturn.toFixed(2)} PLN</h3>
                                        <small className="opacity-75">(Dieta + Wydatki własne)</small>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-success w-100 py-3 fw-bold shadow-sm mt-4" onClick={handleSubmit}>
                                <i className="bi bi-send-fill me-2"></i> WYŚLIJ DO ROZLICZENIA
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL ADD EXPENSE */}
            {showModal && (
                <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Dodaj Nowy Koszt</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Opis (np. Taxi, Parking)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Kwota (PLN)</label>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        value={newExpense.amount}
                                        onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Kto poniósł koszt?</label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input 
                                                className="form-check-input" 
                                                type="radio" 
                                                name="payer" 
                                                id="payerEmployee"
                                                checked={newExpense.payer === 'employee'}
                                                onChange={() => setNewExpense({...newExpense, payer: 'employee'})}
                                            />
                                            <label className="form-check-label" htmlFor="payerEmployee">
                                                Pracownik (Do zwrotu)
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input 
                                                className="form-check-input" 
                                                type="radio" 
                                                name="payer" 
                                                id="payerEmployer"
                                                checked={newExpense.payer === 'employer'}
                                                onChange={() => setNewExpense({...newExpense, payer: 'employer'})}
                                            />
                                            <label className="form-check-label" htmlFor="payerEmployer">
                                                Firma (Karta/Przelew)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Załącznik (Paragon/Faktura)</label>
                                    <input type="file" className="form-control" onChange={handleFileChange} accept="image/*,application/pdf"/>
                                    {newExpense.filePreview && (
                                        <div className="mt-2 text-center">
                                            <img src={newExpense.filePreview} alt="Preview" className="img-thumbnail" style={{maxHeight: '100px'}} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Anuluj</button>
                                <button type="button" className="btn btn-primary" onClick={handleAddExpense}>Dodaj</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SettlementPage;
