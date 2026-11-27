import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import type { User } from '../../types';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('analyst');
  const [subsidiary, setSubsidiary] = useState('CMPDI');
  const [error, setError] = useState('');

  const loadUsers = () => {
    api.get<User[]>('/users').then((res) => setUsers(res.data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', { email, full_name: fullName, password, role, subsidiary });
      setEmail('');
      setFullName('');
      setPassword('');
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user.');
    }
  };

  const toggleActive = async (u: User) => {
    await api.patch(`/users/${u.id}`, { is_active: !u.is_active });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-[28px] font-bold text-on-surface">User Management</h1>
        <p className="text-[16px] text-on-surface-variant">
          Admin-controlled employee accounts and role-based access control.
        </p>
      </div>

      {error && <div className="p-4 rounded-xl bg-error-container text-on-error-container">{error}</div>}

      <form
        onSubmit={handleCreate}
        className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (@cmpdi.cil.in)"
          className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[14px]"
        />
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[14px]"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 chars)"
          className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[14px]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[14px]"
        >
          <option value="viewer">Viewer</option>
          <option value="analyst">Analyst</option>
          <option value="researcher">Researcher</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button
          type="submit"
          className="min-h-[44px] px-4 rounded-xl bg-primary text-on-primary font-semibold text-[14px] hover:bg-primary-container"
        >
          Add User
        </button>
      </form>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-mono text-[11px] uppercase text-on-surface-variant">
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Subsidiary</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-[15px]">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3.5 px-5 font-semibold">{u.full_name}</td>
                <td className="py-3.5 px-4 font-mono text-[13px]">{u.email}</td>
                <td className="py-3.5 px-4">{u.subsidiary || '—'}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-[11px] font-semibold uppercase">
                    {u.roles[0]}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                      u.is_active
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => toggleActive(u)}
                    className="px-3 py-1 rounded-lg bg-surface-container text-[13px] font-semibold hover:bg-surface-container-high"
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
