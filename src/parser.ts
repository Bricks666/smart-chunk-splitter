import { dirname, resolve } from 'node:path';
import { ParserPlugin, parse as babelParse } from '@babel/parser';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
	Identifier,
	ImportDeclaration,
	ImportNamespaceSpecifier,
	ImportSpecifier,
	Program,
	Statement
} from '@babel/types';

import { MayBePromise } from './types';
import { filesUtils } from './utils';
/**
 * @remarks
 * Null means the should be skipped
 */
type PathResolver = (rawPath: string) => MayBePromise<string | null>;

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
	readonly root: ParseNode | null;
}

export const parse = async (options: ParseOptions): Promise<ParseResult> => {
	const { entryPoint, plugins, resolvePath, } = options;

	const rootNode = await parseFilesTree({
		entryPoint,
		plugins,
		resolvePath,
		parentNode: null,
	});

	return {
		root: rootNode,
	};
};

interface ParseFilesTree {
	readonly entryPoint: string;
	readonly resolvePath: PathResolver;
	readonly plugins: ParserPlugin[];
	readonly parentNode: ParseNode | null;
}

const parseFilesTree = async (
	options: ParseFilesTree
): Promise<ParseNode | null> => {
	const { entryPoint, plugins, resolvePath, parentNode, } = options;

	const resolvedPath = await resolvePath(entryPoint);

	if (!resolvedPath) {
		return parentNode;
	}

	const file = await filesUtils.read(resolvedPath);

	const ast = babelParse(file, {
		plugins,
		sourceType: 'unambiguous',
	});

	const node: ParseNode = {
		exports: [],
		imports: [],
		path: resolvedPath,
	};

	const importStatements = extractImportStatements(ast.program);

	const imports = await Promise.all(
		importStatements.map(async (statement) => {
			const childNode = await parseFilesTree({
				entryPoint: resolve(dirname(node.path), statement.path),
				parentNode: node,
				plugins,
				resolvePath,
			});

			return {
				names: statement.names,
				node: childNode,
			};
		})
	);

	node.imports = imports;

	return parentNode ?? node;
};

type RawName = string | 'default' | 'all';

interface RawImportStatement {
	readonly path: string;
	readonly names: RawName[];
}

const extractImportStatements = (program: Program): RawImportStatement[] => {
	const importStatements = program.body.filter(isImportDeclaration);

	return importStatements.map((statement) => {
		const names = statement.specifiers.map((specifier) => {
			if (isNamedImportSpecifier(specifier)) {
				/**
				 * @todo
				 * Check capability {@link specifier.imported} to be StringLiteral type
				 */
				return (specifier.imported as Identifier).name;
			}

			if (isModuleImportSpecifier(specifier)) {
				return 'all';
			}

			return 'default';
		});

		return {
			names,
			path: statement.source.value,
		};
	});
};

const isImportDeclaration = (
	statement: Statement
): statement is ImportDeclaration => {
	return statement.type === 'ImportDeclaration';
};

const isNamedImportSpecifier = (
	statement: ImportDeclaration['specifiers'][0]
): statement is ImportSpecifier => {
	return statement.type === 'ImportSpecifier';
};

const isModuleImportSpecifier = (
	statement: ImportDeclaration['specifiers'][0]
): statement is ImportNamespaceSpecifier => {
	return statement.type === 'ImportNamespaceSpecifier';
};
