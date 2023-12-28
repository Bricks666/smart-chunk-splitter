import { RawPattern } from './types';

export const normalizePattern = (rawPattern: RawPattern): RegExp => {
	return rawPattern as RegExp;
};
