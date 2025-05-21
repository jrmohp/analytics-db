'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface FileData {
    fileNo: string;
    client: string;
    receivedDate: string; // e.g. '2025-05-01'
    fileCount: number;
    facetsCount: number;
    activeFile: number;
    activeFacets: number;
    termedFile: number;
    termedFacets: number;
    futureFile: number;
    futureFacets: number;
    errorCount: number;
    mismatchReason: {
        category: string;
        count: number;
        exampleLine: number;
        description: string;
    }[];
    fileStatus: string;
}

interface FileDataContextType {
    files: FileData[];
    loading: boolean;
    error: string | null;
}

const FileDataContext = createContext<FileDataContextType | undefined>(undefined);

export const FileDataProvider = ({ children }: { children: ReactNode }) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFileData() {
            try {
                const res = await fetch('/filedata.json');
                if (!res.ok) throw new Error(`Failed to fetch file data: ${res.statusText}`);
                const data = await res.json();
                setFiles(data.files);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Unknown error');
                setLoading(false);
            }
        }
        fetchFileData();
    }, []);

    return (
        <FileDataContext.Provider value={{ files, loading, error }}>
            {children}
        </FileDataContext.Provider>
    );
};

export const useFileData = (): FileDataContextType => {
    const context = useContext(FileDataContext);
    if (!context) {
        throw new Error('useFileData must be used within FileDataProvider');
    }
    return context;
};
