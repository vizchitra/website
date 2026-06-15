import { readFileSync } from 'fs';
import { join } from 'path';

export function load() {
	const fundingPath = join(process.cwd(), 'static/funding.json');
	const fundingJson = readFileSync(fundingPath, 'utf-8');
	const fundingData = JSON.parse(fundingJson);

	return { fundingData };
}
