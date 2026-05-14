import CryptoJS from "crypto-js";

export function getGravatarUrl(email: string, size: number = 200) {
  if (!email) return `https://www.gravatar.com/avatar/0?s=${size}&d=identicon`;
  const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
