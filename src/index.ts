import { splitter } from './splitter';

splitter({
	chunksRoots: {
		chunk_a: './a',
		chunk_b: './b',
	},
	projectEntryPoint: './example',
});
