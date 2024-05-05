import { Request as ExpressRequest } from 'express';

export function getRemoteIp(request: ExpressRequest): string {
	return request.headers['x-forwarded-for'] || request.socket.remoteAddress;
}
