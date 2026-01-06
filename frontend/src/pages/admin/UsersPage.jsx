import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const UsersPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChangeRole = async (userId, currentRoleId) => {
        const newRoleId = window.prompt("Podaj nowe ID roli (1=Admin, 2=User, 3=Manager):", currentRoleId);
        if (!newRoleId) return;

        try {
            await api.patch(`/users/${userId}/role`, { roleId: newRoleId });
            alert("Rola zmieniona!");
            loadUsers();
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
                                <th>Dział</th>
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
                                    <td>{u.department?.name || '-'}</td>
                                    <td className="text-end pe-4">
                                        <button 
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => handleChangeRole(u.id, u.roleId)}
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
        </div>
    );
};

export default UsersPage;
