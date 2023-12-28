import { nodeGrouper } from './nodeGrouper';
import { optimizeNodeTree } from './nodeTreeOptimizer';
import { parse } from './parser';
import { createPathResolver } from './pathResolver';
import { normalizePattern } from './patternNormalizer';
import { RawPattern } from './types';

interface ChunksRoots {
	readonly [chunksName: string]: RawPattern;
}

interface Aliases {
	readonly [alias: string]: string;
}

export interface SplitterOptions {
	readonly projectEntryPoint: string;
	readonly chunksRoots: ChunksRoots;
	readonly extensions?: string[];
	readonly aliases?: Aliases;
	readonly ignorePatterns?: RawPattern[];
}

export interface SplitterResult {
	readonly [chunkName: string]: string[];
}

const DEFAULT_EXTENSIONS = ['js', 'cjs', 'mjs', 'ts'];
const DEFAULT_IGNORE_PATTERS = ['node_modules'];
const DEFAULT_ALIASES = {};

export const splitter = (options: SplitterOptions): SplitterResult => {
	const {
		chunksRoots,
		projectEntryPoint,
		extensions = DEFAULT_EXTENSIONS,
		aliases = DEFAULT_ALIASES,
		ignorePatterns = DEFAULT_IGNORE_PATTERS,
	} = options;

	const pathResolver = createPathResolver({
		aliases,
		extensions,
		ignorePatterns: ignorePatterns.map(normalizePattern),
	});

	const parsedNodeTree = parse({
		entryPoint: projectEntryPoint,
		plugins: [],
		resolvePath: pathResolver,
	});

	const optimizedNodeTree = optimizeNodeTree({
		root: parsedNodeTree.root,
	});

	const groupedChunks = nodeGrouper({
		optimizedNodeTree,
		chunks: Object.fromEntries(
			Object.entries(chunksRoots).map(([key, value]) => [
				key,
				normalizePattern(value),
			])
		),
	});

	return groupedChunks;
};
