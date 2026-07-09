import * as htmlToImage from 'html-to-image';

export interface CaptureOptions {
	scale?: number;
	backgroundColor?: string;
	pixelRatio?: number;
}

export interface CaptureResult {
	dataUrl: string;
	blob: Blob | null;
	download: (filename?: string) => void;
}

// Capture DOM node as PNG using html-to-image library

export async function captureNodeAsPNG(
	element: HTMLElement,
	options: CaptureOptions = {}
): Promise<CaptureResult> {
	try {
		const { scale = 2, backgroundColor = '#ffffff', pixelRatio } = options;

		const imageOptions = {
			backgroundColor,
			pixelRatio: pixelRatio ?? scale
		};

		const [dataUrl, blob] = await Promise.all([
			htmlToImage.toPng(element, imageOptions),
			htmlToImage.toBlob(element, imageOptions)
		]);

		return {
			dataUrl,
			blob,
			download: (filename = 'screenshot.png') => {
				const link = document.createElement('a');
				link.download = filename;
				link.href = dataUrl;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		};
	} catch (error) {
		console.error('Screenshot failed:', error);
		throw error;
	}
}

// Example usage:

// // 1. Basic capture
// const el = document.querySelector('#myElement');
// const result = await captureNodeAsPNG(el);
// result.download('screenshot.png');

// // 2. With options
// const result2 = await captureNodeAsPNG(
//   document.querySelector('.card'),
//   {
//     scale: 3,
//     backgroundColor: 'transparent'
//   }
// );
