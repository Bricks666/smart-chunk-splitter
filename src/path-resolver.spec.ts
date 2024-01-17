import { extname, normalize } from 'node:path';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';

import { createPathResolver } from './path-resolver';
import { filesUtils } from './utils';

vi.mock('./utils', () => {
	return {
		filesUtils: {
			isExists: vi.fn().mockImplementation(async (path: string) => {
				return extname(path) === '.ts';
			}),
		},
	};
});

describe('createPathResolver()', () => {
	const extensions = ['.ts', '.js', '.tsx'];
	const ignorePatterns = [/some\/path/];
	const aliases = {
		'@/*': 'root/path/',
	};

	describe('simple case', () => {
		const resolver = createPathResolver({
			extensions,
		});

		const getPathWithExtension = (ext: string = ''): string => {
			return `./some/path/with/extension${ext}`;
		};

		test('should return path if it already full', async () => {
			const path = await resolver(getPathWithExtension('.ts'));

			expect(path).toBe(getPathWithExtension('.ts'));
		});

		test('should return resolved path if it can be resolved with supported extension', async () => {
			const path = await resolver(getPathWithExtension());

			expect(path).toBe(getPathWithExtension('.ts'));
		});

		test('should return null if file has unsupported extension', async () => {
			(filesUtils.isExists as Mock).mockResolvedValueOnce(true);

			const path = await resolver(getPathWithExtension('.svg'));

			expect(path).toBeNull();
		});

		test('should return null if file cannot be resolved with supported extension', async () => {
			(filesUtils.isExists as Mock).mockReturnValue(false);

			const path = await resolver(getPathWithExtension('.ts'));

			expect(path).toBeNull();
		});
	});

	describe('with alias', () => {
		const resolver = createPathResolver({
			extensions,
			aliases,
		});

		const getPathWithAlias = (alias: string = '@/'): string => {
			return `${alias}some/path/with/extension.ts`;
		};

		beforeEach(() => {
			(filesUtils.isExists as Mock).mockReturnValue(true);
		});

		test('should return resolved path if it contains alias', async () => {
			const path = await resolver(getPathWithAlias());

			expect(path).toBe(`${aliases['@/*']}some/path/with/extension.ts`);
		});

		test('should return unchanged path if it contains no alias', async () => {
			const path = await resolver(getPathWithAlias('./'));

			expect(path).toBe(`./some/path/with/extension.ts`);
		});

		test('should return unchanged path if it contains unsupported alias', async () => {
			const path = await resolver(getPathWithAlias('~/'));

			expect(path).toBe(`~/some/path/with/extension.ts`);
		});
	});

	describe('with ignore pattern', () => {
		const resolver = createPathResolver({
			extensions,
			ignorePatterns,
		});

		const getPath = (pathBeginning: string = 'some'): string => {
			return `${pathBeginning}/with/extension.ts`;
		};

		test('should return path if it is not ignored', async () => {
			const path = await resolver(getPath());

			expect(path).toBe(getPath());
		});

		test('should return null if it is ignored', async () => {
			const path = await resolver(getPath('some/path'));

			expect(path).toBeNull();
		});
	});

	describe('with alias and ignore pattern', () => {
		const resolver = createPathResolver({
			extensions,
			aliases,
			ignorePatterns,
		});

		const getPath = (pathBeginning: string = '@'): string => {
			return `${pathBeginning}/with/extension.ts`;
		};

		test('should return resolved path', async () => {
			const path = await resolver(getPath());

			expect(path).toBe(normalize(getPath(aliases['@/*'])));
		});

		test('should return null if resolved path should be ignored', async () => {
			const path = await resolver(getPath('@/some/path'));

			expect(path).toBeNull();
		});
	});
});
