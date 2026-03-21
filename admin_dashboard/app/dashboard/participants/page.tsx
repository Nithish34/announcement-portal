'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllUsers, apiGetAllTeams, apiCreateTeam, apiUpdateUser, UserRow, TeamRow } from '@/lib/api';
import { Users, User, Shield, CheckCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import HoldButton from '@/app/components/HoldButton';

type Toast = { msg: string; type: 'ok' | 'err' };

export default function ParticipantsPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [forming, setForming] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [u, t] = await Promise.all([apiGetAllUsers(), apiGetAllTeams()]);
            setUsers(u);
            setTeams(t);
        } catch {
            notify('Failed to load participants', 'err');
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const formTeams = async () => {
        if (users.length === 0) {
            notify('No participants available', 'err');
            return;
        }

        setForming(true);
        try {
            // Shuffle all participants
            const shuffled = [...users].sort(() => Math.random() - 0.5);
            
            // Teams of 4
            const teamSize = 4;
            const numTeams = Math.ceil(shuffled.length / teamSize) || 1;
            
            // Create teams
            const newTeamIds: string[] = [];
            for (let i = 0; i < numTeams; i++) {
                const teamName = `Team ${String.fromCharCode(65 + i)} ${Math.floor(Math.random() * 1000)}`;
                const created = await apiCreateTeam(teamName);
                newTeamIds.push(created.id);
            }

            // Assign users to new teams
            const promises = shuffled.map((user, idx) => {
                const teamIndex = Math.floor(idx / teamSize);
                return apiUpdateUser(user.id, { teamId: newTeamIds[teamIndex] });
            });

            await Promise.all(promises);
            
            notify(`✓ Successfully formed ${numTeams} teams!`);
            load();
        } catch (e: unknown) {
            notify((e as Error).message ?? 'Failed to form teams', 'err');
        }
        setForming(false);
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Participant Management</h1>
                    <p className="page-subtitle">View all registered participants and initially group them into teams.</p>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex justify-end mb-6">
                <div className="w-full sm:w-auto min-w-[250px]">
                    <HoldButton
                        onTrigger={formTeams}
                        disabled={forming || loading || users.length === 0}
                        holdTimeMs={2000}
                        idleText="FORM TEAMS (GROUPS OF 4)"
                        holdingText="FORMING TEAMS..."
                        successText="TEAMS FORMED!"
                        icon={<Play className="w-4 h-4" />}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : users.length === 0 ? (
                <div className="card text-center py-16">
                    <Users className="w-10 h-10 mx-auto mb-4 text-[#334155]" />
                    <p className="text-sm font-bold text-[#475569] tracking-widest uppercase">No participants registered</p>
                </div>
            ) : (
                <div className="data-table-wrap">
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
                        <User className="w-3.5 h-3.5 text-[#a855f7]" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Registered Participants</span>
                        <span className="ml-auto badge badge-dim">{users.length} user{users.length !== 1 ? 's' : ''}</span>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Team</th>
                                <th>Role</th>
                                <th>Registered On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                const userTeam = teams.find(t => t.id === user.teamId);
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#53389e]/60 to-[#a855f7]/40 flex items-center justify-center text-white text-xs font-black shrink-0">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{user.email}</p>
                                                    <p className="text-[9px] text-[#475569] font-mono mt-0.5">{user.id.slice(0, 12)}…</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {userTeam ? (
                                                <span className="text-xs font-medium text-[#94a3b8]">{userTeam.name}</span>
                                            ) : (
                                                <span className="text-xs italic text-[#475569]">Unassigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-dim text-[10px]">{user.role}</span>
                                        </td>
                                        <td>
                                            <span className="text-[#475569] text-xs">
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
