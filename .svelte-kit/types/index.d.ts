type DynamicRoutes = {
	"/(app)/profile/[username]": { username: string }
};

type Layouts = {
	"/(auth)": undefined;
	"/(app)": { username?: string };
	"/": { username?: string };
	"/(app)/dashboard": undefined;
	"/(auth)/forgot-password": undefined;
	"/(auth)/login": undefined;
	"/(auth)/logout": undefined;
	"/(app)/profile": { username?: string };
	"/(app)/profile/[username]": { username: string };
	"/(auth)/register": undefined;
	"/(auth)/reset-password": undefined;
	"/(auth)/verify-email-notice": undefined;
	"/(auth)/verify-email": undefined
};

export type RouteId = "/(auth)" | "/(app)" | "/" | "/(app)/dashboard" | "/(auth)/forgot-password" | "/(auth)/login" | "/(auth)/logout" | "/(app)/profile" | "/(app)/profile/[username]" | "/(auth)/register" | "/(auth)/reset-password" | "/(auth)/verify-email-notice" | "/(auth)/verify-email";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/dashboard" | "/forgot-password" | "/login" | "/logout" | "/profile" | `/profile/${string}` & {} | "/register" | "/reset-password" | "/verify-email-notice" | "/verify-email";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = never;