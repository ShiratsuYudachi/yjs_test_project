import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: 'src/graphql/schema.graphql',
	documents: 'src/graphql/operations/**/*.graphql',
	generates: {
		'src/graphql/types.ts': {
			plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
		},
	},
};

export default config;


