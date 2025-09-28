import { API_BASE_URL } from '@env';
console.log(API_BASE_URL)
exports.numberVarify = async (token) => {
  console.log(token )
  const response = await fetch(`${API_BASE_URL}/v1/auth/onboarding`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch onboarding data');
  }

  return response.json();
};
