export const environment = {
	production: true,
	apiUrl: getApiUrl(3000),
	siteUrl: getSiteUrl(),
};

function getApiUrl(port: number) {
	const { protocol, hostname } = window.location;
	return `${protocol}//${hostname}:${port}/api`;
}

function getSiteUrl() {
	return window.location.origin;
}
