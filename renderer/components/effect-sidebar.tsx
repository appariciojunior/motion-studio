import * as React from "react";
import { PanelLeftClose } from "lucide-react";
import { Sidebar, SidebarList, SidebarListGroup, SidebarListItem, useSidebarCollapse } from "@glaze/core/components";
import { AppearanceToggle } from "./appearance-toggle";
import { libraryGroups } from "../lib/library";

interface EffectSidebarProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function EffectSidebar({ selectedId, onSelect }: EffectSidebarProps) {
  const sidebarCollapse = useSidebarCollapse();
  const groups = React.useMemo(() => libraryGroups(), []);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});
  const previousSelectedId = React.useRef(selectedId);

  React.useEffect(() => {
    if (previousSelectedId.current === selectedId) return;
    previousSelectedId.current = selectedId;

    const activeGroup = groups.find((group) => group.items.some((item) => item.id === selectedId));
    if (!activeGroup || !collapsedGroups[activeGroup.title]) return;
    setCollapsedGroups((prev) => ({ ...prev, [activeGroup.title]: false }));
  }, [selectedId, groups, collapsedGroups]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Sidebar className="group/sidebar">
      <div className="titlebar-drag flex h-10 shrink-0 items-center gap-2 border-b border-black/[0.08] px-3 dark:border-white/8">
        <img src="/favicon.png" alt="" className="size-5 rounded-md" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground">Motion Studio</span>
        <div className="flex shrink-0 items-center">
          {sidebarCollapse && !sidebarCollapse.collapsed && (
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-black/55 opacity-0 pointer-events-none transition-all hover:text-foreground group-hover/sidebar:opacity-100 group-hover/sidebar:pointer-events-auto dark:text-white/50"
              onClick={sidebarCollapse.toggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
          <AppearanceToggle />
        </div>
      </div>
      <SidebarList>
        {groups.map((group) => (
          <SidebarListGroup
            key={group.title}
            title={group.title}
            collapsed={collapsedGroups[group.title] === true}
            onToggle={() => toggleGroup(group.title)}
          >
            {group.items.map((item) => (
              <SidebarListItem
                key={item.id}
                title={item.name}
                icon={item.icon}
                selected={item.id === selectedId}
                onClick={() => onSelect(item.id)}
              />
            ))}
          </SidebarListGroup>
        ))}
      </SidebarList>
    </Sidebar>
  );
}
