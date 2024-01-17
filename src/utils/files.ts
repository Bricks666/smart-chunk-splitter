import { access } from 'node:fs/promises';

export const isExists = async (path: string): Promise<boolean> => {
	try {
		await access(path);

		return true;
	} catch {
		return false;
	}
};
