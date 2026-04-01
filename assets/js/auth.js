import { showToast } from './utils.js';
import { supabase } from './supabase-client.js';

// Real authentication flow utilizing Supabase Auth
export async function checkSession(basePath = './') {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html');
    
    if (!session && !isLoginPage) {
      // Redirect unauthenticated users to login
      window.location.href = `${basePath}login.html`;
    } else if (session && isLoginPage) {
      // Redirect authenticated users trying to access login page to dashboard
      window.location.href = `${basePath}index.html`;
    }
  } catch(err) {
    console.warn("Session check failed", err);
  }
}

export async function login(email, password, basePath = './') {
  if (email && password) {
    const btn = document.getElementById('login-btn');
    const originalText = btn ? btn.innerHTML : 'Authorize Access';
    if (btn) btn.innerHTML = '<span class="spinner w-4 h-4 mr-2" style="display:inline-block; border-color:white; border-bottom-color:transparent;"></span> Authorizing...';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      if (btn) btn.innerHTML = originalText;
      showToast(error.message, 'error');
    } else {
      // Fetch role and store it for quick UI access
      const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', data.user.id).single();
      if (profile) {
        localStorage.setItem('alpha_vector_role', profile.role);
        localStorage.setItem('alpha_vector_name', profile.full_name || email);
      }
      
      showToast('Login successful. Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = `${basePath}index.html`;
      }, 500);
    }
  } else {
    showToast('Please provide your identification and security key.', 'error');
  }
}

export async function logout(basePath = './') {
  await supabase.auth.signOut();
  localStorage.removeItem('alpha_vector_role');
  localStorage.removeItem('alpha_vector_name');
  window.location.href = `${basePath}login.html`;
}
