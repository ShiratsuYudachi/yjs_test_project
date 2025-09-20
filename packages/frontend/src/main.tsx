import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Title, Textarea, Text } from '@mantine/core';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import './index.css';

const CollaborativeEditor = () => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const ydocRef = useRef<Y.Doc | null>(null);
	const providerRef = useRef<WebsocketProvider | null>(null);
	const ytextRef = useRef<Y.Text | null>(null);

	useEffect(() => {
		if (!textareaRef.current) return;

		// Create Y.js document and connect to WebSocket
		const ydoc = new Y.Doc();
		const provider = new WebsocketProvider('ws://localhost:1234', 'shared-document', ydoc);
		const ytext = ydoc.getText('shared-text');

		ydocRef.current = ydoc;
		providerRef.current = provider;
		ytextRef.current = ytext;

		const textarea = textareaRef.current;

		// Update textarea when Y.js text changes
		const updateTextarea = () => {
			const currentValue = ytext.toString();
			if (textarea.value !== currentValue) {
				const cursorPos = textarea.selectionStart;
				textarea.value = currentValue;
				textarea.setSelectionRange(cursorPos, cursorPos);
			}
		};

		// Listen for Y.js changes
		ytext.observe(updateTextarea);

		// Handle textarea input
		const handleInput = (e: Event) => {
			const target = e.target as HTMLTextAreaElement;
			const value = target.value;
			const currentYText = ytext.toString();

			if (value !== currentYText) {
				ytext.delete(0, ytext.length);
				ytext.insert(0, value);
			}
		};

		textarea.addEventListener('input', handleInput);

		// Initial sync
		updateTextarea();

		// Cleanup
		return () => {
			textarea.removeEventListener('input', handleInput);
			ytext.unobserve(updateTextarea);
			provider.destroy();
			ydoc.destroy();
		};
	}, []);

	return (
		<div className="w-full max-w-4xl mx-auto">
			<Title order={2} className="mb-4">Collaborative Text Editor</Title>
			<Text size="sm" className="mb-4 text-gray-600">
				Open this page in multiple tabs or browsers to see real-time collaboration!
			</Text>
			<Textarea
				ref={textareaRef}
				placeholder="Start typing... changes will sync across all connected clients"
				minRows={10}
				className="w-full"
			/>
		</div>
	);
};

const App = () => {
	return (
		<MantineProvider>
			<Container className="min-h-screen py-8">
				<CollaborativeEditor />
			</Container>
		</MantineProvider>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);


