import { ParseNode } from './parser';

export interface OptimizeNodeTreeOptions {
	readonly root: ParseNode;
}

export interface ExportStatement {
	readonly directWay: string;
	readonly names: string[];
}

export interface ImportStatement {
	readonly name: string;
	readonly userPaths: string[];
}

export interface OptimizedNode {
	readonly path: string;
	readonly exports: ExportStatement[];
	readonly imports: ImportStatement[];
}

export interface OptimizedNodeTree {
	readonly [path: string]: OptimizedNode;
}

export interface OptimizeNodeTreeResult {
	readonly tree: OptimizedNodeTree;
}

export const optimizeNodeTree = (
	_options: OptimizeNodeTreeOptions
): OptimizedNodeTree => {
	return {};
};
