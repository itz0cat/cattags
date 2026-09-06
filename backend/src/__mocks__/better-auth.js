const users = new Map();
const sessions = new Map();

function betterAuth(options) {
  return {
    options,
    handler: async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
    api: {
      signUpEmail: async ({ body }) => {
        if (!body.email || !body.password) throw new Error('Email and password are required');
        const normalized = body.email.toLowerCase().trim();
        if (users.has(normalized)) throw new Error('User with this email already exists');

        const user = {
          id: 'user_' + Math.random().toString(36).substring(2, 10),
          email: normalized,
          name: body.name || normalized.split('@')[0],
          minecraftUsername: body.minecraftUsername,
          role: body.role || 'USER',
          emailVerified: process.env.NODE_ENV === 'test' ? true : false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        users.set(normalized, user);

        const session = {
          id: 'sess_' + Math.random().toString(36).substring(2, 10),
          token: 'better_auth_token_' + Math.random().toString(36).substring(2, 10),
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
        sessions.set(session.token, { user, session });

        if (options?.emailVerification?.sendVerificationEmail) {
          try {
            await options.emailVerification.sendVerificationEmail({
              user,
              url: `http://localhost:8080/verify-email?token=tok_${user.id}`,
              token: `tok_${user.id}`
            });
          } catch (e) {
            // ignore
          }
        }

        return { user, session, token: session.token };
      },
      signInEmail: async ({ body }) => {
        const normalized = body.email.toLowerCase().trim();
        const user = users.get(normalized);
        if (!user) throw new Error('Invalid email or password');

        const session = {
          id: 'sess_' + Math.random().toString(36).substring(2, 10),
          token: 'better_auth_token_' + Math.random().toString(36).substring(2, 10),
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
        sessions.set(session.token, { user, session });
        return { user, session, token: session.token };
      },
      getSession: async ({ headers }) => {
        const authHeader = (headers && typeof headers.get === 'function' ? headers.get('authorization') : headers?.authorization) || '';
        if (authHeader.startsWith('Bearer better_auth_token_')) {
          const token = authHeader.replace('Bearer ', '').trim();
          return sessions.get(token) || null;
        }
        return null;
      }
    }
  };
}

module.exports = {
  betterAuth
};
