export interface Env {
	MY_BUCKET: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return uploadLogo(request, env);
	},
	async scheduled(request: Request, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(uploadLogo(request, env));
	},
};

async function uploadLogo(request: Request, env: Env): Promise<Response> {
	// Fetch updates from the Airhex Updates API
	const updatesResponse = await fetch('https://content.airhex.com/api/v3.7/updates/?limit=2&type=logo');
	const updatesData: any = await updatesResponse.json();

	// Process each updated logo
	for (const logo in updatesData) {
		// Fetch PNG formats
		const pngResponse = await fetch(`https://content.airhex.com/content/logos/airlines_${updatesData?.[logo].icao}_350_350_t.png`);

		// Store in R2
		await env.MY_BUCKET.put(`logos/${logo}.png`, pngResponse.body);
	}

	return new Response('Logos updated successfully', { status: 200 });
}
