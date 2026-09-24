// Certifications grid on the Learning page.
// PLACEHOLDER: every entry below is an example. Replace names, issuers and years with the
// certificates you have actually earned, and delete any you don't have.
export type Cert = { name: string; issuer: string; year: string; url?: string }

export const certs: Cert[] = [
  { name: 'SQL certificate (placeholder)', issuer: 'Issuer name', year: '20XX' },
  { name: 'Python certificate (placeholder)', issuer: 'Issuer name', year: '20XX' },
  { name: 'Data analysis certificate (placeholder)', issuer: 'Issuer name', year: '20XX' },
]
