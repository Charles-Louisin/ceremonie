"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { TabSwitcher, type TabId } from "./components/TabSwitcher";
import { CheckInTab } from "./components/CheckInTab";
import { TablesTab } from "./components/TablesTab";
import { LoadingShell } from "./components/LoadingShell";

export default function HomePage() {
  const [tab, setTab] = useState<TabId>("checkin");

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="px-4 pb-4 sm:px-6">
        <TabSwitcher active={tab} onChange={setTab} />
      </div>
      <LoadingShell>
        <div hidden={tab !== "checkin"} className={tab === "checkin" ? "flex flex-1 flex-col" : ""}>
          <CheckInTab />
        </div>
        <div hidden={tab !== "tables"} className={tab === "tables" ? "flex flex-1 flex-col" : ""}>
          <TablesTab />
        </div>
      </LoadingShell>
    </div>
  );
}
