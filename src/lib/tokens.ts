/**
 * Centralized color token system for VizChitra.
 * Supports canvas/D3 (hex), CSS vars, and Tailwind utilities.
 */

// Core color type - only the 6 base theme colors
export type Color = 'yellow' | 'teal' | 'blue' | 'orange' | 'pink' | 'grey';

// Token structure for each color
export interface ColorTokens {
	// Canvas/D3 layer - base color hex value
	hex: string;
	// CSS layer - base color CSS var
	cssVar: string;
}

// Theme structure (extended tokens with variants)
// Includes CSS vars for light/dark/muted variants (defined in CSS)
export interface ThemeTokens {
	base: string; // var(--color-viz-{color})
	light: string; // var(--color-viz-{color}-light)
	dark: string; // var(--color-viz-{color}-dark)
	muted: string; // var(--color-viz-{color}-muted)
	subtle: string; // var(--color-viz-{color}-subtle)
	solid: string; // var(--color-viz-{color}-solid)
	// Tailwind utilities
	bg: string; // bg-viz-{color}-light
	border: string; // border-viz-{color}-muted
	text: string; // text-viz-{color}-dark
}

// Color tokens map (hex + cssVar for the 6 base colors)
export const colorTokens: Record<Color, ColorTokens> = {
	yellow: {
		hex: '#D4AA5A',
		cssVar: 'var(--color-viz-yellow)'
	},
	teal: {
		hex: '#6BC3BB',
		cssVar: 'var(--color-viz-teal)'
	},
	blue: {
		hex: '#95AFF1',
		cssVar: 'var(--color-viz-blue)'
	},
	orange: {
		hex: '#FC915B',
		cssVar: 'var(--color-viz-orange)'
	},
	pink: {
		hex: '#FE82B8',
		cssVar: 'var(--color-viz-pink)'
	},
	grey: {
		hex: '#B1B1B1',
		cssVar: 'var(--color-viz-grey)'
	}
};

// Theme tokens map (extended variants for all 6 colors)
export const themeTokens: Record<Color, ThemeTokens> = {
	grey: {
		base: 'var(--color-viz-grey)',
		light: 'var(--color-viz-grey-light)',
		dark: 'var(--color-viz-grey-dark)',
		muted: 'var(--color-viz-grey-muted)',
		subtle: 'var(--color-viz-grey-subtle)',
		solid: 'var(--color-viz-grey-solid)',
		bg: 'bg-viz-grey-light',
		border: 'border-viz-grey-muted',
		text: 'text-viz-grey-dark'
	},
	pink: {
		base: 'var(--color-viz-pink)',
		light: 'var(--color-viz-pink-light)',
		dark: 'var(--color-viz-pink-dark)',
		muted: 'var(--color-viz-pink-muted)',
		subtle: 'var(--color-viz-pink-subtle)',
		solid: 'var(--color-viz-pink-solid)',
		bg: 'bg-viz-pink-light',
		border: 'border-viz-pink-muted',
		text: 'text-viz-pink-dark'
	},
	blue: {
		base: 'var(--color-viz-blue)',
		light: 'var(--color-viz-blue-light)',
		dark: 'var(--color-viz-blue-dark)',
		muted: 'var(--color-viz-blue-muted)',
		subtle: 'var(--color-viz-blue-subtle)',
		solid: 'var(--color-viz-blue-solid)',
		bg: 'bg-viz-blue-light',
		border: 'border-viz-blue-muted',
		text: 'text-viz-blue-dark'
	},
	teal: {
		base: 'var(--color-viz-teal)',
		light: 'var(--color-viz-teal-light)',
		dark: 'var(--color-viz-teal-dark)',
		muted: 'var(--color-viz-teal-muted)',
		subtle: 'var(--color-viz-teal-subtle)',
		solid: 'var(--color-viz-teal-solid)',
		bg: 'bg-viz-teal-light',
		border: 'border-viz-teal-muted',
		text: 'text-viz-teal-dark'
	},
	yellow: {
		base: 'var(--color-viz-yellow)',
		light: 'var(--color-viz-yellow-light)',
		dark: 'var(--color-viz-yellow-dark)',
		muted: 'var(--color-viz-yellow-muted)',
		subtle: 'var(--color-viz-yellow-subtle)',
		solid: 'var(--color-viz-yellow-solid)',
		bg: 'bg-viz-yellow-light',
		border: 'border-viz-yellow-muted',
		text: 'text-viz-yellow-dark'
	},
	orange: {
		base: 'var(--color-viz-orange)',
		light: 'var(--color-viz-orange-light)',
		dark: 'var(--color-viz-orange-dark)',
		muted: 'var(--color-viz-orange-muted)',
		subtle: 'var(--color-viz-orange-subtle)',
		solid: 'var(--color-viz-orange-solid)',
		bg: 'bg-viz-orange-light',
		border: 'border-viz-orange-muted',
		text: 'text-viz-orange-dark'
	}
};

/**
 * Historical - Not aligned with current theme tokens, but kept for reference and potential use in specific components.
 * 8-color palette for BannerCurve (5 main + 3 light variants)
 */
export const CURVE_PALETTE = [
	'#FC915B',
	'#FFF3CC',
	'#FFD485',
	'#FFD6EB',
	'#EF75AB',
	'#DDF7F2',
	'#88E0D8',
	'#9FBAFC'
] as const;

export const CURVE_PALETTE_ORANGE = [
	'#FFF0E5',
	'#FFD9BE',
	'#FFB88A',
	'#FC915B',
	'#E86D38',
	'#C84D1A',
	'#A0360A',
	'#7A2305'
] as const;

export const CURVE_PALETTE_BLUE = [
	'#EFF4FF',
	'#C8D9FF',
	'#9FBAFC',
	'#7099F0',
	'#4F78E0',
	'#3158C4',
	'#1A3AA6',
	'#0D2478'
] as const;

export const CURVE_PALETTE_TEAL = [
	'#E8F9F7',
	'#BBF0EB',
	'#88E0D8',
	'#5CCEC4',
	'#35BAAE',
	'#1E9D92',
	'#107874',
	'#065255'
] as const;

export const CURVE_PALETTE_PINK = [
	'#FEF0F6',
	'#FAC8E4',
	'#F49ACC',
	'#EF75AB',
	'#E0518B',
	'#C32F6A',
	'#9C1549',
	'#760530'
] as const;

export const CURVE_PALETTE_YELLOW = [
	'#FFFBEB',
	'#FFF3CC',
	'#FFE899',
	'#FFD485',
	'#FFC055',
	'#E5A800',
	'#B87D00',
	'#8A5A00'
] as const;

/**
 * Get color tokens with fallback to a default color.
 */
export function getColorTokens(color: Color | undefined, fallback: Color = 'yellow'): ColorTokens {
	return colorTokens[color ?? fallback] ?? colorTokens[fallback];
}

/**
 * Get hex color value for canvas/D3 usage.
 */
export function getColorHex(color: Color): string {
	const tokens = colorTokens[color] ?? colorTokens.yellow;
	return tokens.hex;
}

/**
 * Get CSS custom property for dynamic styling.
 */
export function getColorVar(color: Color): string {
	return colorTokens[color]?.cssVar ?? colorTokens.yellow.cssVar;
}

/**
 * All available colors as an array (useful for iteration/validation).
 */
export const colors: Color[] = ['yellow', 'teal', 'blue', 'orange', 'pink', 'grey'];

/**
 * Type guard to check if a string is a valid Color.
 */
export function isValidColor(value: string): value is Color {
	return colors.includes(value as Color);
}

/**
 * Get random color for dynamic components.
 */
export function getRandomColor(): Color {
	return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get theme tokens for a color (includes light/dark/muted variants and Tailwind utilities).
 */
export function getTheme(color: Color): ThemeTokens {
	return themeTokens[color];
}
