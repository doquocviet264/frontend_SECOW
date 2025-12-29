import { useMemo, useState } from "react";

type TabKey = "desc" | "specs" | "policy";

type Props = {
  description: string[];
  specs: { label: string; value: string }[];
  returnPolicy: string[];
};

export default function ProductTabs({ description, specs, returnPolicy }: Props) {
  const [tab, setTab] = useState<TabKey>("desc");

  const tabBtn = (key: TabKey, label: string) => {
    const active = tab === key;
    return (
      <button
        type="button"
        onClick={() => setTab(key)}
        className={[
          "px-4 py-2 text-sm border-b-2 transition-colors",
          active ? "font-bold text-primary border-primary" : "font-medium text-gray-500 dark:text-gray-400 border-transparent",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  const content = useMemo(() => {
    if (tab === "desc") {
      return (
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
          {description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );
    }

    if (tab === "specs") {
      return (
        <div className="border border-border-color dark:border-white/10 rounded-xl overflow-hidden">
          {specs.map((row, i) => (
            <div
              key={row.label}
              className={[
                "grid grid-cols-3 gap-4 px-4 py-3 text-sm",
                i % 2 === 0 ? "bg-background-light dark:bg-background-dark" : "bg-surface-light dark:bg-surface-dark",
              ].join(" ")}
            >
              <div className="col-span-1 text-gray-500 dark:text-gray-400 font-medium">{row.label}</div>
              <div className="col-span-2 text-text-main dark:text-white">{row.value}</div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <ul className="list-disc list-inside space-y-1">
          {returnPolicy.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    );
  }, [tab, description, specs, returnPolicy]);

  return (
    <div className="mt-6">
      <div className="flex border-b border-border-color dark:border-white/10 mb-4">
        {tabBtn("desc", "Mô tả chi tiết")}
        {tabBtn("specs", "Thông số kỹ thuật")}
        {tabBtn("policy", "Chính sách đổi trả")}
      </div>
      {content}
    </div>
  );
}
