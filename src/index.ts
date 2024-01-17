import { splitter } from './splitter';

const result = splitter({
	chunksRoots: {
		chunk_a: './a',
		chunk_b: './b',
	},
	projectEntryPoint: './example',
});

console.log(result);
