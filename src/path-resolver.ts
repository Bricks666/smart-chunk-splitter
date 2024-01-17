import { extname, normalize, resolve } from 'node:path';
import stringToRegExp from 'string-to-regexp';

import { MayBePromise } from './types';
import { filesUtils } from './utils';

export type PathResolver = (path: string) => MayBePromise<string | null>;

export interface CreatePathResolverOptions {
	readonly extensions: string[];
	readonly root: string;
	readonly aliases?: Record<string, string>;
	readonly ignorePatterns?: RegExp[];
}

export const createPathResolver = (
	options: CreatePathResolverOptions
): PathResolver => {
	const { extensions, root, aliases = {}, ignorePatterns = [], } = options;

	const aliasResolver = createAliasResolver(aliases);
	const ignoreChecker = createIgnoreChecker(ignorePatterns);
	const extensionResolver = createExtensionResolver(extensions);

	return async (path) => {
		const resolved = resolve(root, path);

		const aliasedPath = aliasResolver(resolved);

		const ignored = ignoreChecker(aliasedPath);

		if (ignored) {
			return null;
		}

		return extensionResolver(aliasedPath);
	};
};

const createExtensionResolver = (extensions: string[]) => {
	const extensionAndIndexFile = extensions.concat(
		extensions.map((ext) => `/index.${ext}`)
	);

	return async (path: string): Promise<string | null> => {
		const exists = await filesUtils.isExists(path);

		if (exists) {
			const file = await filesUtils.isFile(path);

			if (file) {
				const hasSupportedExtension = extensions.some(
					(extension) => extname(path) === extension
				);

				return hasSupportedExtension ? path : null;
			}
		}

		const existing = await Promise.all(
			extensionAndIndexFile.map((addition) =>
				filesUtils.isExists(`${path}${addition}`)
			)
		);

		const fileAdditionIndex = existing.findIndex((exists) => exists);

		const fileAddition = extensionAndIndexFile[fileAdditionIndex];

		if (!fileAddition) {
			return null;
		}

		return `${path}${fileAddition}`;
	};
};

interface PreparedAlias {
	readonly pattern: RegExp;
	readonly path: string;
}

const createAliasResolver = (aliases: Record<string, string>) => {
	const preparedAliases: PreparedAlias[] = Object.entries(aliases).map(
		([aliasPattern, path]) => {
			return {
				path,
				pattern: stringToRegExp(aliasPattern),
			};
		}
	);

	return (path: string): string => {
		const pair = preparedAliases.find((pair) => pair.pattern.test(path));

		if (!pair?.path) {
			return path;
		}

		return normalize(path.replace(pair.pattern, pair.path));
	};
};

const createIgnoreChecker = (ignorePatters: RegExp[]) => {
	return (path: string): boolean => {
		return ignorePatters.some((pattern) => pattern.test(path));
	};
};
