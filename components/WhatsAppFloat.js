export default function WhatsAppFloat({ whatsapp = "" }) {
  const number = String(whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, "");
  if (!number) return null;
  const href = `https://wa.me/${number}?text=${encodeURIComponent("Hi SYBOC INDUSTRIES, I would like to know more about your products.")}`;
  return <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with SYBOC INDUSTRIES on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.2A12.7 12.7 0 0 0 5 22.2L3.4 28.6l6.6-1.6A12.8 12.8 0 1 0 16 3.2Zm0 23.3c-2 0-3.8-.5-5.5-1.5l-.4-.2-3.9.9 1-3.8-.3-.4a10.5 10.5 0 1 1 9.1 5Zm5.8-7.8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.1-3.6-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.4 4.8 2 .9 2.8 1 3.8.9.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" fill="currentColor"/></svg></a>;
}
