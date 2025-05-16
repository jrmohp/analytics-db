'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LobMonthData {
    [lob: string]: {
        [month: string]: {
            received: number;
            loaded: number;
            billed: number;
            activeMembers: number;
            billedMembers: number;
            balanced: boolean;
            termedMembers: number;
            selfBilledAmount: number;
            facetsBilledAmount: number;
        };
    };
}

interface LobAggregate {
    [lob: string]: {
        received: number;
        loaded: number;
        billed: number;
        activeMembers: number;
        billedMembers: number;
        balancedCount: number;
        monthsCount: number;
        termedMembers: number;
        selfBilledAmount: number;
        facetsBilledAmount: number;
    };
}

export interface Client {
    id: string;
    name: string;
    lob: string;
    lobMonthData: LobMonthData;
    lobLast12MonthsAggregate: LobAggregate;
}

interface ClientDataContextType {
    clients: Client[];
    selectedClient: Client | null;
    setSelectedClient: (client: Client) => void;
    loading: boolean;
    error: string | null;
}

const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

export const ClientDataProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchClientData() {
            try {
                const res = await fetch('/clientdata.json');
                if (!res.ok) {
                    throw new Error(`Failed to fetch client data: ${res.statusText}`);
                }
                const data = await res.json();
                setClients(data.clients);

                if (data.clients.length > 0) {
                    setSelectedClient(data.clients[0]); // default first client selected
                }

                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Unknown error');
                setLoading(false);
            }
        }
        fetchClientData();
    }, []);

    return (
        <ClientDataContext.Provider
            value={{ clients, selectedClient, setSelectedClient, loading, error }}
        >
            {children}
        </ClientDataContext.Provider>
    );
};

export const useClientData = (): ClientDataContextType => {
    const context = useContext(ClientDataContext);
    if (!context) {
        throw new Error('useClientData must be used within ClientDataProvider');
    }
    return context;
};
