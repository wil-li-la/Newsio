import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Processing auth callback...');
        console.log('📍 Current URL:', window.location.href);
        
        // 添加短暫延遲，讓用戶看到 "Verifying..." 狀態
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 解析 URL 參數
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        const tokenHash = queryParams.get('token_hash');
        const typeFromQuery = queryParams.get('type');
        
        console.log('🔑 Extracted params:', { 
          accessToken: accessToken?.substring(0, 20) + '...', 
          hasRefreshToken: !!refreshToken,
          type,
          tokenHash: tokenHash?.substring(0, 20) + '...',
          typeFromQuery
        });

        // 如果有 token_hash（來自 Supabase 驗證連結），使用 verifyOtp
        if (tokenHash && typeFromQuery) {
          console.log('🔐 Using verifyOtp with token_hash...');
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: typeFromQuery,
          });

          if (error) {
            console.error('❌ VerifyOtp error:', error);
            setError(error.message);
            setStatus('error');
            setTimeout(() => navigate('/?error=verification_failed'), 3000);
            return;
          }

          if (data.session) {
            console.log('✅ Email verified via OTP:', data.session.user.email);
            setStatus('success');
            setTimeout(() => navigate('/'), 3000);
            return;
          }
        }

        // 如果有 access_token 和 refresh_token，設定 session
        if (accessToken && refreshToken) {
          console.log('🔐 Setting session with tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('❌ SetSession error:', error);
            setError(error.message);
            setStatus('error');
            setTimeout(() => navigate('/?error=verification_failed'), 3000);
            return;
          }

          if (data.session) {
            console.log('✅ Session set:', data.session.user.email);
            setStatus('success');
            setTimeout(() => navigate('/'), 3000);
            return;
          }
        }

        // 否則嘗試獲取現有 session
        console.log('🔍 Checking existing session...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Session error:', error);
          setError(error.message);
          setStatus('error');
          setTimeout(() => navigate('/?error=verification_failed'), 3000);
          return;
        }

        if (data.session) {
          console.log('✅ Session verified:', data.session.user.email);
          setStatus('success');
          setTimeout(() => navigate('/'), 3000);
        } else {
          console.log('⚠️ No session found');
          setStatus('error');
          setError('No valid session or token found. Please try signing up again.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err);
        setError(err.message);
        setStatus('error');
        setTimeout(() => navigate('/?error=unknown'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Verifying your email...</h2>
            <p style={styles.subtitle}>Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Email Verified!</h2>
            <p style={styles.subtitle}>
              Your email has been successfully verified.
              <br />
              Redirecting to the app...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✗</div>
            <h2 style={styles.title}>Verification Failed</h2>
            <p style={styles.subtitle}>
              {error || 'Unable to verify your email.'}
              <br />
              Redirecting back...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0A84FF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#34C759',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  errorIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#FF3B30',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7280',
    lineHeight: '1.5',
  },
};
