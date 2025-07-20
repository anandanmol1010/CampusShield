export const generateTicketID = (): string => {
  const randomValues = window.crypto.getRandomValues(new Uint8Array(3));
  return `CSHLD-${Array.from(randomValues).map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
};
