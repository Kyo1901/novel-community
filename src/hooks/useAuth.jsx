import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * AuthProvider 컴포넌트
 *
 * Props:
 * @param {node} children - 인증 상태를 사용할 하위 트리 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentSession) => {
    const userId = currentSession?.user?.id;
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from('nv_admins')
      .select('admin_id, name')
      .eq('admin_id', userId)
      .maybeSingle();

    if (adminRow) {
      setIsAdmin(true);
      setProfile({ id: adminRow.admin_id, nickname: adminRow.name });
      return;
    }

    setIsAdmin(false);
    const { data: userRow } = await supabase
      .from('nv_users')
      .select('user_id, nickname')
      .eq('user_id', userId)
      .maybeSingle();

    if (userRow) {
      setProfile({ id: userRow.user_id, nickname: userRow.nickname });
      return;
    }

    // 이메일 인증 대기 중 가입한 경우, 최초 로그인 시 지연 생성된 닉네임으로 프로필을 만든다.
    const pendingNickname = currentSession.user.user_metadata?.nickname;
    if (pendingNickname) {
      const { data: createdRow } = await supabase
        .from('nv_users')
        .insert({ user_id: userId, nickname: pendingNickname })
        .select('user_id, nickname')
        .maybeSingle();
      setProfile(createdRow ? { id: createdRow.user_id, nickname: createdRow.nickname } : null);
      return;
    }

    setProfile(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      loadProfile(currentSession).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      loadProfile(currentSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
