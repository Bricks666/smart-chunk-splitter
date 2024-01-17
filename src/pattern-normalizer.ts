import stringToRegExp from 'string-to-regexp';

import { RawPattern } from './types';

export const normalizePattern = (rawPattern: RawPattern): RegExp => {
	return rawPattern instanceof RegExp ? rawPattern : stringToRegExp(rawPattern);
};
