import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const TransportRoutesPage = () => {
    // === 1. DATA STATE ===
    const [cities, setCities] = useState([]);
    const [types, setTypes] = useState([]);
    const [providers, setProviders] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [routes, setRoutes] = useState([]);

    // === 2. UI STATE (Cascading Dropdowns) ===
    // Origin
    const [originContinent, setOriginContinent] = useState('');
    const [originCountryId, setOriginCountryId] = useState('');
    
    // Destination
    const [destContinent, setDestContinent] = useState('');
    const [destCountryId, setDestCountryId] = useState('');

    // Form
    const [formData, setFormData] = useState({
        originCityId: '',
        destinationCityId: '',
        transportTypeId: '',
        providerId: '',
        price: '',
        currency: 'PLN'
    });

    // === 3. FETCHING DATA ===
    const fetchAllData = async () => {
        try {
            const [citiesRes, typesRes, providersRes, currenciesRes, routesRes] = await Promise.all([
                api.get('/cities'),
                api.get('/transport-types'),
                api.get('/transport-providers'),
                api.get('/currencies'),
                api.get('/transport-routes')
            ]);
            
            setCities(citiesRes.data);
            setTypes(typesRes.data);
            setProviders(providersRes.data);
            setCurrencies(currenciesRes.data);
            setRoutes(routesRes.data);
        } catch (error) {
            console.error("Błąd pobierania danych:", error);
            alert("Nie udało się pobrać danych.");
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // === 4. HELPER LOGIC ===

    // Get unique continents from cities
    const getContinents = () => {
        const continents = cities.map(c => c.country?.continent).filter(Boolean);
        return [...new Set(continents)].sort();
    };

    // Get unique countries for a selected continent
    const getCountriesByContinent = (continent) => {
        if (!continent) return [];
        const filteredCities = cities.filter(c => c.country?.continent === continent);
        const uniqueCountries = [];
        const seenIds = new Set();
        
        filteredCities.forEach(c => {
            if (c.country && !seenIds.has(c.country.id)) {
                seenIds.add(c.country.id);
                uniqueCountries.push(c.country);
            }
        });
        return uniqueCountries.sort((a, b) => a.name.localeCompare(b.name));
    };

    // Get cities for a selected country
    const getCitiesByCountry = (countryId) => {
        if (!countryId) return [];
        return cities.filter(c => c.country?.id === parseInt(countryId)).sort((a, b) => a.name.localeCompare(b.name));
    };

    // Filter providers by selected Type
    const getFilteredProviders = () => {
        if (!formData.transportTypeId) return []; // Show none or all? User said "wyswietlaly się tylko linie lotnicze" if plane selected.
        // If type is selected, filter. If not, maybe empty? Or all? Let's show empty to force type selection.
        return providers.filter(p => {
             // p.typeId check (if backend sends it) OR p.type?.id
             const pType = p.typeId || p.type?.id;
             return pType === parseInt(formData.transportTypeId);
        });
    };

    // Unique Currencies (Merge hardcoded common with fetched)
    const getUniqueCurrencies = () => {
        const hardcoded = ["PLN", "EUR", "USD"];
        const fetched = currencies.map(c => c.code);
        return [...new Set([...hardcoded, ...fetched])];
    };

    // === 5. FORM HANDLERS ===
    const handleOriginContinentChange = (val) => {
        setOriginContinent(val);
        setOriginCountryId('');
        setFormData({ ...formData, originCityId: '' });
    };

    const handleOriginCountryChange = (val) => {
        setOriginCountryId(val);
        setFormData({ ...formData, originCityId: '' });
    };

    const handleDestContinentChange = (val) => {
        setDestContinent(val);
        setDestCountryId('');
        setFormData({ ...formData, destinationCityId: '' });
    };

    const handleDestCountryChange = (val) => {
        setDestCountryId(val);
        setFormData({ ...formData, destinationCityId: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.originCityId === formData.destinationCityId) {
            alert("Miasto początkowe i końcowe muszą być różne!");
            return;
        }
        if (Number(formData.price) < 0) {
            alert("Cena nie może być ujemna!");
            return;
        }

        try {
            await api.post('/transport-routes', formData);
            alert("Trasa dodana pomyślnie!");
            
            // Fetch updated routes
            const routesRes = await api.get('/transport-routes');
            setRoutes(routesRes.data);
            
            // Clear price only
            setFormData({ ...formData, price: '' });

        } catch (error) {
            console.error(error);
            alert("Błąd dodawania trasy.");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary fw-bold">Cennik i Trasy</h2>

            <div className="row g-4">
                {/* --- FORMULARZ --- */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h4 className="fw-bold mb-3">Definiuj Trasę</h4>
                        <form onSubmit={handleSubmit}>
                            
                            {/* SKĄD */}
                            <div className="card bg-light border-0 p-3 mb-3">
                                <h6 className="fw-bold text-muted mb-2 text-uppercase small">Skąd (Początek)</h6>
                                <div className="row g-2">
                                    <div className="col-12">
                                        <select className="form-select border-0" value={originContinent} onChange={e => handleOriginContinentChange(e.target.value)}>
                                            <option value="">1. Kontynent</option>
                                            {getContinents().map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <select className="form-select border-0" value={originCountryId} onChange={e => handleOriginCountryChange(e.target.value)} disabled={!originContinent}>
                                            <option value="">2. Kraj</option>
                                            {getCountriesByContinent(originContinent).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <select 
                                            className="form-select border-0 fw-bold" 
                                            required 
                                            value={formData.originCityId} 
                                            onChange={e => setFormData({...formData, originCityId: e.target.value})}
                                            disabled={!originCountryId}
                                        >
                                            <option value="">3. Miasto (Wybierz)</option>
                                            {getCitiesByCountry(originCountryId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* DOKĄD */}
                            <div className="card bg-light border-0 p-3 mb-3">
                                <h6 className="fw-bold text-muted mb-2 text-uppercase small">Dokąd (Cel)</h6>
                                <div className="row g-2">
                                    <div className="col-12">
                                        <select className="form-select border-0" value={destContinent} onChange={e => handleDestContinentChange(e.target.value)}>
                                            <option value="">1. Kontynent</option>
                                            {getContinents().map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <select className="form-select border-0" value={destCountryId} onChange={e => handleDestCountryChange(e.target.value)} disabled={!destContinent}>
                                            <option value="">2. Kraj</option>
                                            {getCountriesByContinent(destContinent).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <select 
                                            className="form-select border-0 fw-bold" 
                                            required 
                                            value={formData.destinationCityId} 
                                            onChange={e => setFormData({...formData, destinationCityId: e.target.value})}
                                            disabled={!destCountryId}
                                        >
                                            <option value="">3. Miasto (Wybierz)</option>
                                            {getCitiesByCountry(destCountryId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-2 mb-3">
                                {/* Typ Transportu */}
                                <div className="col-6">
                                    <label className="form-label text-muted small fw-bold">Typ</label>
                                    <select 
                                        className="form-select bg-light border-0"
                                        required
                                        value={formData.transportTypeId}
                                        onChange={e => setFormData({...formData, transportTypeId: e.target.value, providerId: ''})}
                                    >
                                        <option value="">-- Typ --</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>

                                {/* Przewoźnik (Filtrowany) */}
                                <div className="col-6">
                                    <label className="form-label text-muted small fw-bold">Przewoźnik</label>
                                    <select 
                                        className="form-select bg-light border-0"
                                        required
                                        value={formData.providerId}
                                        onChange={e => setFormData({...formData, providerId: e.target.value})}
                                        disabled={!formData.transportTypeId}
                                    >
                                        <option value="">-- Firma --</option>
                                        {getFilteredProviders().map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Cena */}
                            <div className="row g-2 mb-4">
                                <div className="col-7">
                                    <label className="form-label text-muted small fw-bold">Cena</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        className="form-control bg-light border-0"
                                        placeholder="0.00"
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                <div className="col-5">
                                    <label className="form-label text-muted small fw-bold">Waluta</label>
                                    <select 
                                        className="form-select bg-light border-0"
                                        value={formData.currency}
                                        onChange={e => setFormData({...formData, currency: e.target.value})}
                                    >
                                        {getUniqueCurrencies().map(code => <option key={code} value={code}>{code}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm">
                                Dodaj Trasę
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- TABELA (Prawa kolumna) --- */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm overflow-hidden h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-secondary">Zdefiniowane Połączenia</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="bg-light text-secondary">
                                    <tr>
                                        <th className="ps-4">Trasa</th>
                                        <th>Szczegóły</th>
                                        <th className="text-end pe-4">Koszt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routes.map(route => (
                                        <tr key={route.id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">
                                                    {route.originCity?.name} <i className="bi bi-arrow-right mx-1 text-muted"></i> {route.destinationCity?.name}
                                                </div>
                                                <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>
                                                    {route.originCity?.country?.name} ({route.originCity?.country?.continent})  {route.destinationCity?.country?.name}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-primary">{route.provider?.name}</div>
                                                <span className="badge bg-light text-secondary border">
                                                    {route.transportType?.name}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <span className="fs-5 fw-bold text-success">
                                                    {route.price} <small className="fs-6 text-muted">{route.currency}</small>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {routes.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-5 text-muted">
                                                Brak tras. Użyj formularza aby dodać nowe połączenia.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportRoutesPage;
