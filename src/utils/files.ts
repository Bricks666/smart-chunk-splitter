import { access, readFile, lstat } from 'node:fs/promises';

export const isExists = async (path: string): Promise<boolean> => {
	try {
		await access(path);

		return true;
	} catch {
		return false;
	}
};

export const isFile = async (path: string): Promise<boolean> => {
	return lstat(path).then((stats) => stats.isFile());
};

export const read = async (path: string): Promise<string> => {
	return readFile(path, 'utf-8');
};
