// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import type { Actions, PageServerLoad } from './$types';

export const load = async () => {
  throw redirect(302, '/');
};

export const actions = {
  default: async ({ locals, cookies }: import('./$types').RequestEvent) => {
    if (!locals.session) {
      throw redirect(302, '/');
    }

    await lucia.invalidateSession(locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });

    throw redirect(302, '/');
  }
};;null as any as PageServerLoad;;null as any as Actions;