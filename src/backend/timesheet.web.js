import { webMethod, Permissions } from 'wix-web-module';
import { fetch } from 'wix-fetch';

const GOOGLE_API_URL =
  'https://script.google.com/macros/s/AKfycbwRwdWRF4T2y6Zzui5Wyw1dSybz4ZeHz19OC5nIY-eiHGG6WQyDRV45vcqhJo2Tl68J/exec';

export const getEmployees = webMethod(
  Permissions.Anyone,
  async () => {
    const url =
      `${GOOGLE_API_URL}?action=employees`;

    const response = await fetch(url, {
      method: 'get'
    });

    if (!response.ok) {
      throw new Error(
        `Google API error: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(
        data.error || 'Unable to load employees'
      );
    }

    return data.employees;
  }
);

export const getEmployeeHours = webMethod(
  Permissions.Anyone,
  async (employeeName) => {
    const url =
      `${GOOGLE_API_URL}?action=hours&employee=` +
      encodeURIComponent(employeeName);

    const response = await fetch(url, {
      method: 'get'
    });

    if (!response.ok) {
      throw new Error(
        `Google API error: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(
        data.error || 'Unable to load hours'
      );
    }

    return data;
  }
);