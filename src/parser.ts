import { ParserPlugin } from '@babel/parser';
/**
 * @remarks
 * Null means the should be skipped
 */
type PathResolver = (rawPath: string) => string | null;

export interface ParseOptions {
	readonly entryPoint: string;
	readonly resolvePath: PathResolver;
	readonly plugins: ParserPlugin[];
}

export interface ImportStatement {
	readonly node: ParseNode;
	readonly names: string[];
}

export interface ParseNode {
	readonly path: string;
	readonly exports: string[];
	readonly imports: ImportStatement[];
}

export interface ParseResult {
	readonly root: ParseNode;
}

export const parse = (_options: ParseOptions): ParseResult => {
	return {
		root: {
			path: 'stub-path',
			imports: [],
			exports: [],
		},
	};
};
