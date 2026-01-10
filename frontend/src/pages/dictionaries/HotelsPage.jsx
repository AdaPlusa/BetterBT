import { useState, useEffect } from 'react';
import api from '../../services/api';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [formData, setFormData] = useState({ name: '', cityId: '', imageUrl: '' });
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHotels();
    fetchCountries();
    fetchCities();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get('/hotels');
      setHotels(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd pobierania hoteli.');
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries');
      setCountries(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const availableCities = cities.filter(c => c.countryId === parseInt(selectedCountryId));

  const handleOpenModal = (hotel = null) => {
      setError(null);
      if (hotel) {
          // Edit Mode
          const city = cities.find(c => c.id === hotel.cityId);
          setSelectedCountryId(city ? city.countryId : '');
          setFormData({
              name: hotel.name,
              cityId: hotel.cityId,
              imageUrl: hotel.imageUrl || ''
          });
          setEditingId(hotel.id);
      } else {
          // Add Mode
          setEditingId(null);
          setFormData({ name: '', cityId: '', imageUrl: '' });
          setSelectedCountryId('');
      }
      setShowModal(true);
  };

  const handleCloseModal = () => {
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', cityId: '', imageUrl: '' });
      setSelectedCountryId('');
      setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/hotels/${editingId}`, formData);
      } else {
        await api.post('/hotels', formData);
      }
      
      handleCloseModal();
      fetchHotels();
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu hotelu.');
    }
  };

  // Filters & Sorting
  const [filterName, setFilterName] = useState('');
  const [filterCityId, setFilterCityId] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredHotels = hotels.filter(h => {
      const matchName = h.name.toLowerCase().includes(filterName.toLowerCase());
      const matchCity = filterCityId ? h.cityId === parseInt(filterCityId) : true;
      return matchName && matchCity;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten hotel?")) return;
    try {
      await api.delete(`/hotels/${id}`);
      fetchHotels();
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.error || 'Błąd usuwania hotelu.';
        alert(msg);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Hotele</h2>
        <button className="btn btn-primary fw-bold shadow-sm" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-lg me-2"></i>Dodaj Hotel
        </button>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        {/* Filtry */}
        <div className="card-header bg-white p-3 border-bottom-0">
            <div className="row g-2">
                <div className="col-md-6">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Szukaj po nazwie..." 
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <select 
                        className="form-select"
                        value={filterCityId}
                        onChange={(e) => setFilterCityId(e.target.value)}
                    >
                        <option value="">Wszystkie miasta</option>
                        {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="ps-4 py-3 fw-bold text-uppercase small" style={{width: '60px'}}>No</th>
                <th 
                    className="py-3 fw-bold text-uppercase small cursor-pointer"
                    onClick={handleSort}
                    style={{cursor: 'pointer'}}
                >
                    Nazwa
                    {sortOrder === 'asc' ? <i className="bi bi-sort-alpha-down ms-1"></i> : <i className="bi bi-sort-alpha-up ms-1"></i>}
                </th>
                <th className="py-3 fw-bold text-uppercase small">Miasto</th>
                <th className="py-3 fw-bold text-uppercase small">Kraj</th>
                <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {sortedHotels.map((hotel, index) => {
                const city = hotel.city || cities.find(c => c.id === hotel.cityId);
                const countryName = city?.country?.name || countries.find(c => c.id === city?.countryId)?.name || '-';

                return (
                  <tr key={hotel.id}>
                    <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                    <td className="fw-bold text-dark">{hotel.name}</td>
                    <td><span className="badge bg-white text-secondary border">{city ? city.name : hotel.cityId}</span></td>
                    <td><small className="text-secondary fw-bold">{countryName}</small></td>
                    <td className="pe-4 text-end text-nowrap">
                      <button 
                        className="btn btn-sm btn-link text-decoration-none fw-bold me-2"
                        style={{color: 'var(--st-blue)'}}
                        onClick={() => handleOpenModal(hotel)}
                      >
                        <i className="bi bi-pencil me-1"></i>Edytuj
                      </button>
                      <button 
                        className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                        onClick={() => handleDelete(hotel.id)}
                      >
                        <i className="bi bi-trash me-1"></i>Usuń
                      </button>
                    </td>
                  </tr>
                );
              })}
               {sortedHotels.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Brak hoteli spełniających kryteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* MODAL */}
       {showModal && (
        <>
        <div className="modal-backdrop fade show"></div>
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-primary">
                            {editingId ? "Edytuj Hotel" : "Dodaj Hotel"}
                        </h5>
                        <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                    </div>
                    <div className="modal-body p-4">
                        {error && <div className="alert alert-danger rounded-3 small">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Nazwa Hotelu</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg bg-light border-0" 
                                    placeholder="np. Marriott" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Zdjęcie Hotelu</label>
                                <input 
                                    type="file" 
                                    className="form-control form-control-lg bg-light border-0" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, imageUrl: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {formData.imageUrl && (
                                    <div className="mt-2 text-center p-2 bg-light border rounded">
                                        <img src={formData.imageUrl} alt="Podgląd" style={{maxHeight: '150px', maxWidth: '100%'}} />
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Kraj</label>
                                <select 
                                    className="form-select form-select-lg bg-light border-0"
                                    value={selectedCountryId}
                                    onChange={(e) => {
                                        setSelectedCountryId(e.target.value);
                                        setFormData({...formData, cityId: ''});
                                    }}
                                    required
                                >
                                    <option value="">-- Wybierz Kraj --</option>
                                    {countries.map(country => (
                                        <option key={country.id} value={country.id}>{country.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold">Miasto</label>
                                <select 
                                    className="form-select form-select-lg bg-light border-0"
                                    value={formData.cityId}
                                    onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                                    required
                                    disabled={!selectedCountryId}
                                >
                                    <option value="">-- Wybierz Miasto --</option>
                                    {availableCities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-primary btn-lg">
                                    {editingId ? 'Zapisz Zmiany' : 'Dodaj Hotel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>
      )}
    </div>
  );
};

export default HotelsPage;
