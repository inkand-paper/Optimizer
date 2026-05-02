import crypto from "crypto";

export function getGravatarUrl(email: string, size: number = 200) {
  const hash = crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
