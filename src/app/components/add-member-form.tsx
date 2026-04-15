'use client';

import { useState } from 'react';
import { Button } from '@/app/components/button';
import { AVAILABLE_MEMBER_ROLES } from '@/types/team';

export function AddMemberForm({ onSubmit, onCancel, isLoading }: any) {
    const [name, setName] = useState('');
    const [role, setRole] = useState(AVAILABLE_MEMBER_ROLES[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onSubmit(name, role);
        setName('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name"
                className="border p-2 w-full"
            />

            <select value={role} onChange={e => setRole(e.target.value)}>
                {AVAILABLE_MEMBER_ROLES.map(r => (
                    <option key={r}>{r}</option>
                ))}
            </select>

            <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>Add</Button>
                <Button type="button" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
}