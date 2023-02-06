import { css as cssImport } from '@emotion/react';
import styledImport from '@emotion/styled';

declare module 'twin.macro' {
	const css: typeof cssImport;
	const styled: typeof styledImport;
}
