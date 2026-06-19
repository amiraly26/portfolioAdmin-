(function () {
  const config = window.APP_CONFIG;

  if (!config || !window.supabase) {
    console.error("Supabase config or library is missing.");
    return;
  }

  const client = window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  );

  window.authClient = client;

  function goTo(path) {
    const basePath = window.location.pathname.includes("/admin/")
      ? ".."
      : ".";
    const normalized = path.charAt(0) === "/" ? path : "/" + path;
    const useBasePath =
      window.location.protocol === "file:" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost";

    window.location.href = useBasePath ? basePath + normalized : normalized;
  }

  async function requireAuth() {
    const result = await client.auth.getSession();
    const session = result.data.session;

    if (!session) {
      goTo(config.loginPath);
      return null;
    }

    return session;
  }

  async function redirectIfLoggedIn() {
    const result = await client.auth.getSession();
    const session = result.data.session;

    if (session) {
      goTo(config.adminRedirectPath);
    }
  }

  async function loginWithPassword(email, password) {
    return client.auth.signInWithPassword({
      email: email,
      password: password
    });
  }

  async function logout() {
    await client.auth.signOut();
    goTo(config.loginPath);
  }

  window.authHelpers = {
    requireAuth: requireAuth,
    redirectIfLoggedIn: redirectIfLoggedIn,
    loginWithPassword: loginWithPassword,
    logout: logout
  };
})();
