import { nodeGrouper } from './nodeGrouper';
import { optimizeNodeTree } from './nodeTreeOptimizer';
import { parse } from './parser';
import { createPathResolver } from './path-resolver';
import { normalizePattern } from './pattern-normalizer';
import { RawPattern } from './types';

interface ChunksRoots {
	readonly [chunksName: string]: string;
}

interface Aliases {
	readonly [alias: string]: string;
}

export interface SplitterOptions {
	readonly projectEntryPoint: string;
	readonly chunksRoots: ChunksRoots;
	readonly root?: string;
	readonly extensions?: string[];
	readonly aliases?: Aliases;
	readonly ignorePatterns?: RawPattern[];
}

export interface SplitterResult {
	readonly [chunkName: string]: string[];
}

const DEFAULT_EXTENSIONS = ['.js', '.cjs', '.mjs', '.ts'];
const DEFAULT_IGNORE_PATTERS = ['node_modules'];
const DEFAULT_ROOT = process.cwd();
const DEFAULT_ALIASES = {};

/**
 * @todo
 * Write e2e
 */
export const splitter = async (
	options: SplitterOptions
): Promise<SplitterResult | null> => {
	const {
		chunksRoots,
		projectEntryPoint,
		root = DEFAULT_ROOT,
		extensions = DEFAULT_EXTENSIONS,
		aliases = DEFAULT_ALIASES,
		ignorePatterns = DEFAULT_IGNORE_PATTERS,
	} = options;

	const pathResolver = createPathResolver({
		extensions,
		root,
		aliases,
		ignorePatterns: ignorePatterns.map(normalizePattern),
	});

	const parsedNodeTree = await parse({
		entryPoint: projectEntryPoint,
		plugins: [],
		resolvePath: pathResolver,
	});

	if (!parsedNodeTree.root) {
		return null;
	}

	const optimizedNodeTree = optimizeNodeTree({
		root: parsedNodeTree.root,
	});

	const groupedChunks = nodeGrouper({
		optimizedNodeTree,
		chunks: Object.fromEntries(
			Object.entries(chunksRoots).map(([key, value]) => [
				key,
				normalizePattern(value)
			])
		),
	});

	return groupedChunks;
};
