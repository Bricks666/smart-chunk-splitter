
export type PathResolver = (path: string) => string | null;

export interface CreatePathResolverOptions {
	readonly extensions: string[];
	readonly aliases: Record<string, string>;
	readonly ignorePatterns?: RegExp[];
}

export const createPathResolver = (
	_options: CreatePathResolverOptions
): PathResolver => {
	return () => null;
};
