import { useEffect, useState } from 'react';
import api from '../../services/api';

const Step4_Summary = ({ formData, prevStep, handleSubmit, setFormData }) => {
    
    const [dailyRate, setDailyRate] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (formData.destinationId) {
            api.get(`/cities/${formData.destinationId}`)
               .then(res => {
                   const rate = res.data.country?.perDiemRate ? parseFloat(res.data.country.perDiemRate) : (formData.isInternational ? 300 : 45);
                   setDailyRate(rate);
                   setLoading(false);
               })
               .catch(err => {
                   console.error(err);
                   setDailyRate(formData.isInternational ? 300 : 45); // Fallback
                   setLoading(false);
               });
        }
    }, [formData.destinationId, formData.isInternational]);

    // Oblicz liczbę dni
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const durationMs = end - start;
    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; // Dni kalendarzowe (włącznie)

    // Koszt diety
    const dietCost = Math.max(0, days * dailyRate);

    // Sumowanie
    const transport = parseFloat(formData.transportCost || 0);
    const hotel = parseFloat(formData.hotelCost || 0);
    const totalCost = transport + hotel + dietCost;

    // Aktualizacja kosztu w stanie głównym (żeby poszło do bazy)
    useEffect(() => {
        if (!loading) {
            setFormData(prev => ({ ...prev, estimatedCost: totalCost }));
        }
    }, [totalCost, loading]);

    return (
        <div>
            <h4 className="mb-4 text-center">Podsumowanie Kosztów</h4>
            
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <table className="table table-borderless mb-0">
                        <tbody>
                            <tr className="border-bottom">
                                <td className="py-3 text-secondary">Transport</td>
                                <td className="py-3 text-end fw-bold">{transport} PLN</td>
                            </tr>
                            <tr className="border-bottom">
                                <td className="py-3 text-secondary">Nocleg</td>
                                <td className="py-3 text-end fw-bold">{hotel} PLN</td>
                            </tr>
                            <tr className="border-bottom">
                                <td className="py-3 text-secondary">
                                    Dieta ({days} dni x {dailyRate} PLN)
                                    {formData.isInternational && <span className="badge bg-info ms-2">Zagraniczna</span>}
                                </td>
                                <td className="py-3 text-end fw-bold">{dietCost} PLN</td>
                            </tr>
                            <tr className="bg-light">
                                <td className="py-3 fw-bold fs-5">Szacowany Koszt Całkowity</td>
                                <td className="py-3 text-end fw-bold fs-4 text-primary">{totalCost} PLN</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary" onClick={prevStep}>Wróć i Popraw</button>
                <button 
                    className="btn btn-success btn-lg px-5 shadow" 
                    onClick={handleSubmit}
                >
                    <i className="bi bi-send-check me-2"></i>Wyślij Wniosek
                </button>
            </div>
        </div>
    );
};

export default Step4_Summary;
