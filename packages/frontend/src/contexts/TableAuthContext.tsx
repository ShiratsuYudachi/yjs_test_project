import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface TableAuthState {
	password: string | null;
	status: 'OK' | 'failed';
}

interface TableAuthContextType extends TableAuthState {
	setPassword: (password: string | null) => void;
	setStatus: (status: TableAuthState['status']) => void;
}

const TableAuthContext = createContext<TableAuthContextType | undefined>(undefined);

export const useTableAuth = () => {
	const context = useContext(TableAuthContext);
	if (!context) {
		throw new Error('useTableAuth must be used within TableAuthProvider');
	}
	return context;
};

interface TableAuthProviderProps {
	children: ReactNode;
}

export const TableAuthProvider: React.FC<TableAuthProviderProps> = ({ children }) => {
	const [password, setPassword] = useState<string | null>(null);
	const [status, setStatus] = useState<TableAuthState['status']>('OK');

 

	return (
		<TableAuthContext.Provider value={{
			password,
			status,
			setPassword,
			setStatus,
		}}>
			{children}
		</TableAuthContext.Provider>
	);
};
