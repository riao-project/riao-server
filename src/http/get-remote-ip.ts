import { Request as ExpressRequest } from 'express';

export function getRemoteIp(request: ExpressRequest): string {
	let forwardIps: string[] = [];
	const forwardedHeader: undefined | string | string[] =
		request.headers['x-forwarded-for'];

	if (forwardedHeader) {
		forwardIps = Array.isArray(forwardedHeader)
			? forwardedHeader
			: [forwardedHeader];
	}

	let ips: string[] = [];

	const remoteIp: undefined | string = request.socket.remoteAddress;

	if (remoteIp) {
		ips.push(remoteIp);
	}

	if (forwardIps.length) {
		ips = ips.concat(forwardIps);
	}

	return ips.join(', ');
}
