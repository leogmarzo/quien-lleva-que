"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";

type Props = {
  url: string;
  eventName: string;
};

export function ShareButton({ url, eventName }: Props) {
  const [copied, setCopied] = useState(false);

  if (!url) {
    return <Button variant="ghost" size="md" disabled>Compartir</Button>;
  }

  const whatsappText = `Te paso el link para anotar qué llevás al evento "${eventName}":\n${url}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("No pudimos copiar el link", "error");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <Button variant="secondary" size="md">
          <Share2 className="w-4 h-4" />
          Compartir por WhatsApp
        </Button>
      </a>
      <Button variant="ghost" size="md" onClick={copyLink}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copiado" : "Copiar link"}
      </Button>
    </div>
  );
}
