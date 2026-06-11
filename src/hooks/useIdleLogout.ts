import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const IDLE_TIMEOUT = 5 * 60 * 1000;

export function useIdleLogout() {
  const supabase = createClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login?reason=idle';
  }, [supabase]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;

      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    });
  }, [resetTimer, supabase]);
}
