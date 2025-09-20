import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: 'src/graphql/schema.graphql',
	documents: [],
	generates: {
		'src/graphql/types.ts': {
			plugins: ['typescript'],
		},
	},
};

export default config;


