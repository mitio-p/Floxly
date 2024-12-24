export default async function authFetch(url, options) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    const generateTokenResponse = await fetch('http://localhost:3000/auth/refreshToken', { credentials: 'include' });

    if (generateTokenResponse.ok) {
      const newResponse = await fetch(url, options);
      return newResponse;
    } else {
      return response;
    }
  } else {
    return response;
  }
}
