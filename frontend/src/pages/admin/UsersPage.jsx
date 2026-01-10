import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRoleId, setNewRoleId] = useState('');

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadRoles = async () => {
        try {
            const res = await api.get('/roles');
            setRoles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setNewRoleId(user.roleId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setNewRoleId('');
    };

    const handleSaveRole = async () => {
        if (!selectedUser || !newRoleId) return;

        try {
            await api.patch(`/users/${selectedUser.id}/role`, { roleId: newRoleId });
            handleCloseModal();
            loadUsers();
            // Optional: Success toast
        } catch (err) {
            alert("Błąd zmiany roli");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary fw-bold">Zarządzanie Użytkownikami</h2>
            
            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="ps-4">Użytkownik</th>
                                <th>Email</th>
                                <th>Rola</th>
                                <th className="text-end pe-4">Akcja</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{u.firstName} {u.lastName}</div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.roleId === 1 ? 'bg-danger' : (u.roleId === 2 ? 'bg-info' : 'bg-primary')}`}>
                                            {u.role?.name || `ID: ${u.roleId}`}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button 
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => handleOpenModal(u)}
                                        >
                                            Zmień Rolę
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
                                    Zmień Rolę
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="mb-2 text-muted small fw-bold">Użytkownik:</p>
                                <h5 className="fw-bold mb-4">{selectedUser?.firstName} {selectedUser?.lastName}</h5>

                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Wybierz nową rolę</label>
                                    <select 
                                        className="form-select form-select-lg bg-light border-0"
                                        value={newRoleId}
                                        onChange={(e) => setNewRoleId(e.target.value)}
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="d-grid gap-2 mt-4">
                                    <button 
                                        className="btn btn-primary btn-lg fw-bold"
                                        onClick={handleSaveRole}
                                    >
                                        Zapisz Zmiany
                                    </button>
                                    <button 
                                        className="btn btn-light text-muted"
                                        onClick={handleCloseModal}
                                    >
                                        Anuluj
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default UsersPage;
