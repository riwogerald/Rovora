type DynamicRoutes = {
	"/api/codex/[entryId]": { entryId: string };
	"/api/games/[slug]": { slug: string };
	"/api/library/[entryId]": { entryId: string };
	"/(app)/profile/[username]": { username: string }
};

type Layouts = {
	"/(auth)": undefined;
	"/(app)": { username?: string };
	"/": { entryId?: string; slug?: string; username?: string };
	"/api": { entryId?: string; slug?: string };
	"/api/codex": { entryId?: string };
	"/api/codex/[entryId]": { entryId: string };
	"/api/games": { slug?: string };
	"/api/games/[slug]": { slug: string };
	"/api/library": { entryId?: string };
	"/api/library/[entryId]": { entryId: string };
	"/api/search": undefined;
	"/api/search/autocomplete": undefined;
	"/api/social": undefined;
	"/api/social/comments": undefined;
	"/api/social/feed": undefined;
	"/api/social/follow": undefined;
	"/api/social/likes": undefined;
	"/(app)/dashboard": undefined;
	"/(auth)/forgot-password": undefined;
	"/(auth)/login": undefined;
	"/(auth)/logout": undefined;
	"/(app)/profile": { username?: string };
	"/(app)/profile/[username]": { username: string };
	"/(auth)/register": undefined;
	"/(auth)/reset-password": undefined;
	"/(app)/search": undefined;
	"/(auth)/verify-email-notice": undefined;
	"/(auth)/verify-email": undefined
};

export type RouteId = "/(auth)" | "/(app)" | "/" | "/api" | "/api/codex" | "/api/codex/[entryId]" | "/api/games" | "/api/games/[slug]" | "/api/library" | "/api/library/[entryId]" | "/api/search" | "/api/search/autocomplete" | "/api/social" | "/api/social/comments" | "/api/social/feed" | "/api/social/follow" | "/api/social/likes" | "/(app)/dashboard" | "/(auth)/forgot-password" | "/(auth)/login" | "/(auth)/logout" | "/(app)/profile" | "/(app)/profile/[username]" | "/(auth)/register" | "/(auth)/reset-password" | "/(app)/search" | "/(auth)/verify-email-notice" | "/(auth)/verify-email";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/api" | "/api/codex" | `/api/codex/${string}` & {} | "/api/games" | `/api/games/${string}` & {} | "/api/library" | `/api/library/${string}` & {} | "/api/search" | "/api/search/autocomplete" | "/api/social" | "/api/social/comments" | "/api/social/feed" | "/api/social/follow" | "/api/social/likes" | "/dashboard" | "/forgot-password" | "/login" | "/logout" | "/profile" | `/profile/${string}` & {} | "/register" | "/reset-password" | "/search" | "/verify-email-notice" | "/verify-email";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = never;