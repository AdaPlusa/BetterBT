import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Step1_General from '../../components/wizard/Step1_General';
import Step2_Transport from '../../components/wizard/Step2_Transport';
import Step3_Hotel from '../../components/wizard/Step3_Hotel';
import Step4_Summary from '../../components/wizard/Step4_Summary';

const TripWizardPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Stan Główny - wszystkie dane delegacji
    const [formData, setFormData] = useState({
        destinationId: '',
        originCityId: '', // Dodano
        isInternational: false, // Dodano
        startDate: '',
        endDate: '',
        purpose: '',
        transportType: false,
        transportProviderId: null,
        transportTypeId: null,
        transportCost: 0, 
        transportDetails: '',
        hotelId: null,
        hotelName: '', // Dodano dla wyświetlania w Step4?
        hotelCost: 0,
        hotelCheckIn: '',
        hotelCheckOut: '',
        estimatedCost: 0 // Dodano
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        try {
            const userStr = sessionStorage.getItem('user');
            if (!userStr) {
                alert("Błąd: Brak zalogowanego użytkownika!");
                return;
            }
            const user = JSON.parse(userStr);

            const payload = {
                ...formData,
                userId: user.id
            };

            await api.post('/trips', payload);
            // Zamiast alertu i przekierowania, idź do kroku 5 (Sukces)
            setStep(5);
        } catch (e) {
            console.error(e);
            alert("Wystąpił błąd podczas wysyłania wniosku.");
        }
    };

    return (
        <div className="container mt-4">
            
            {step < 5 && (
                 <>
                    <h2 className="text-center mb-4">Planowanie Delegacji</h2>
                    <div className="card shadow-lg">
                        <div className="card-header bg-primary text-white">
                            Krok {step} z 4
                        </div>
                        <div className="card-body">
                            {step === 1 && (
                                <Step1_General 
                                    formData={formData} 
                                    handleChange={handleChange} 
                                    nextStep={nextStep} 
                                />
                            )}
                            {step === 2 && (
                                <Step2_Transport 
                                    formData={formData} 
                                    setFormData={setFormData} // Podmieniono na setFormData
                                    nextStep={nextStep} 
                                    prevStep={prevStep}
                                />
                            )}
                            {step === 3 && (
                                <Step3_Hotel 
                                    formData={formData}
                                    setFormData={setFormData} // Podmieniono
                                    handleChange={handleChange} 
                                    nextStep={nextStep} 
                                    prevStep={prevStep}
                                />
                            )}
                            {step === 4 && (
                                <Step4_Summary 
                                    formData={formData} 
                                    setFormData={setFormData} // Dodano
                                    prevStep={prevStep} 
                                    handleSubmit={handleSubmit} 
                                />
                            )}
                        </div>
                    </div>
                </>
            )}

            {step === 5 && (
                <div className="text-center mt-5 pt-5">
                    <div className="display-1 text-success mb-4">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 className="mb-3 fw-bold">Gratulacje!</h2>
                    <p className="lead mb-4">
                        Twój wniosek został wysłany do Managera i oczekuje na akceptację.
                    </p>
                    <button 
                        className="btn btn-primary btn-lg px-5 shadow" 
                        onClick={() => navigate('/')}
                    >
                        Wróć do Pulpitu
                    </button>
                    {/* Confetti effect could go here */}
                </div>
            )}

        </div>
    );
};

export default TripWizardPage;
