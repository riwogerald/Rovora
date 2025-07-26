export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13')
];

export const server_loads = [0];

export const dictionary = {
		"/": [2],
		"/(app)/dashboard": [~3],
		"/(auth)/forgot-password": [~7],
		"/(auth)/login": [~8],
		"/(auth)/logout": [~9],
		"/(app)/profile": [~4],
		"/(app)/profile/[username]": [~5],
		"/(auth)/register": [~10],
		"/(auth)/reset-password": [~11],
		"/(app)/search": [6],
		"/(auth)/verify-email-notice": [~13],
		"/(auth)/verify-email": [~12]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';