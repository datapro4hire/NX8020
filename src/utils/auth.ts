export const loginWithGoogle = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

export const checkAuth = async () => {
  const response = await fetch('http://localhost:5000/api/auth/check', {
    credentials: 'include'
  });
  return response.ok;
};

export const logout = async () => {
  await fetch('http://localhost:5000/api/auth/logout', {
    credentials: 'include'
  });
  window.location.reload();
};
