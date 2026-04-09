type AdminLoginProps = {
  error?: string;
};

export function AdminLogin({ error }: AdminLoginProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(143,174,139,0.25),_transparent_45%),linear-gradient(180deg,_#fdfbf7_0%,_#f4efe6_100%)] px-4 py-10 text-forest">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-sage-light/30 bg-white/90 p-8 shadow-xl backdrop-blur">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-dark">
              Админ-панель
            </p>
            <h1 className="text-3xl font-bold">Вход для менеджера</h1>
            <p className="text-sm text-forest/60">
              Введите пароль, чтобы просматривать заявки с сайта.
            </p>
          </div>

          <form action="/admin/login" method="post" className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Пароль</span>
              <input
                type="password"
                name="password"
                required
                className="h-12 w-full rounded-xl border border-sage-light/40 bg-cream px-4 outline-none transition focus:border-sage"
              />
            </label>

            {error === "invalid_password" ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                Неверный пароль.
              </p>
            ) : null}

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sage to-sage-dark font-semibold text-white shadow-lg transition hover:from-sage-dark hover:to-forest"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
