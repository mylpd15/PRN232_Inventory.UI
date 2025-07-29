

const API_BASE = `${import.meta.env.VITE_SERVER_URL}/odata/Providers`;

function getToken() {
  return localStorage.getItem('accessToken');
}



export interface CreateProviderDto {
  ProviderName: string;
  ProviderAddress?: string;
}

export async function getProviders() {
  const res = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  return Array.isArray(data.value) ? data.value : [];
}



// Create a new provider
export async function createProvider(dto: CreateProviderDto){
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg || `Failed to create provider: ${res.status}`);
  }
  return res.json();
}
