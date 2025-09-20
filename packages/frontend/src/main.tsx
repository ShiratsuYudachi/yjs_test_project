import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Button, Container, Title } from '@mantine/core';
import './index.css';

const App = () => {
	return (
		<MantineProvider>
			<Container className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Title order={2}>Hello World from Frontend</Title>
					<div className="mt-4">
						<Button>Click me</Button>
					</div>
				</div>
			</Container>
		</MantineProvider>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);


