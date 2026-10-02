"use client";

import { useTranslations } from "next-intl";

type Item = { seat: number; dataUrl: string; fileName: string };

export function DownloadTickets({ items }: { items: Item[] }) {
  const t = useTranslations("ticket");

  function save(item: Item) {
    const link = document.createElement("a");
    link.href = item.dataUrl;
    link.download = item.fileName;
    link.click();
  }

  async function saveAll() {
    for (const item of items) {
      save(item);
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => void saveAll()}
        className="btn btn-primary"
      >
        {t("downloadAll")}
      </button>
    </div>
  );
}

export function DownloadOne({ dataUrl, fileName, label }: { dataUrl: string; fileName: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        link.click();
      }}
      className="text-sm text-muted hover:text-cream"
    >
      {label}
    </button>
  );
}
