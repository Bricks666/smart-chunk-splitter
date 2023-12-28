import { OptimizedNodeTree } from './nodeTreeOptimizer';

interface Chunks {
	readonly [chunkName: string]: RegExp;
}

export interface NodeGrouperOptions {
	readonly optimizedNodeTree: OptimizedNodeTree;
	readonly chunks: Chunks;
}

export interface NodeGrouperResult {
	readonly [chunkName: string]: string[];
}

export const nodeGrouper = (
	_options: NodeGrouperOptions
): NodeGrouperResult => {
	return {};
};
