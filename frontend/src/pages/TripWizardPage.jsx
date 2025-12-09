import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Step1_General from '../components/wizard/Step1_General';
import Step2_Transport from '../components/wizard/Step2_Transport';
import Step3_Hotel from '../components/wizard/Step3_Hotel';
import Step4_Summary from '../components/wizard/Step4_Summary';

const TripWizardPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Stan Główny - wszystkie dane delegacji
    const [formData, setFormData] = useState({
        destinationId: '',
        startDate: '',
        endDate: '',
        purpose: '',
        transportType: false,
        transportCost: '', 
        hotelId: '',
        hotelCheckIn: '',
        hotelCheckOut: ''
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
            const userStr = localStorage.getItem('user');
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
            alert("Delegacja wysłana pomyślnie!");
            navigate('/');
        } catch (e) {
            console.error(e);
            alert("Wystąpił błąd podczas wysyłania wniosku.");
        }
    };

    return (
        <div className="container mt-4">
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
                            handleChange={handleChange} 
                            nextStep={nextStep} 
                            prevStep={prevStep}
                            setFormData={setFormData}
                        />
                    )}
                    {step === 3 && (
                        <Step3_Hotel 
                            formData={formData} 
                            handleChange={handleChange} 
                            nextStep={nextStep} 
                            prevStep={prevStep}
                        />
                    )}
                    {step === 4 && (
                        <Step4_Summary 
                            formData={formData} 
                            prevStep={prevStep} 
                            handleSubmit={handleSubmit} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripWizardPage;
