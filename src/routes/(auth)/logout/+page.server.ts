import { redirect } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  throw redirect(302, '/');
};

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
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
};