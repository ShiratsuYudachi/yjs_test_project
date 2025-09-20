import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
	userName: string | null;
	setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within UserProvider');
	}
	return context;
};

interface UserProviderProps {
	children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [userName, setUserName] = useState<string | null>(null);

	return (
		<UserContext.Provider value={{
			userName,
			setUserName,
		}}>
			{children}
		</UserContext.Provider>
	);
};
