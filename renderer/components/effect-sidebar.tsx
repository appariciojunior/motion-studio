import * as React from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Sidebar, SidebarList, SidebarListGroup, SidebarListItem } from "@glaze/core/components";
import { AppearanceToggle } from "./appearance-toggle";
import { libraryGroups } from "../lib/library";

interface EffectSidebarProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function EffectSidebar({ selectedId, onSelect }: EffectSidebarProps) {
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

  const anyGroupExpanded = groups.some((group) => collapsedGroups[group.title] !== true);

  const toggleAllGroups = () => {
    if (anyGroupExpanded) {
      setCollapsedGroups(Object.fromEntries(groups.map((group) => [group.title, true])));
      return;
    }
    setCollapsedGroups({});
  };

  const groupsToggleLabel = anyGroupExpanded ? "Collapse all groups" : "Expand all groups";

  return (
    <Sidebar className="group/sidebar">
      <div className="titlebar-drag flex h-10 shrink-0 items-center gap-2 border-b border-black/[0.08] px-3 dark:border-white/8">
        <img src="/favicon.png" alt="" className="size-5 rounded-md" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground">Motion Studio</span>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-black/55 opacity-0 pointer-events-none transition-all hover:bg-black/[0.07] hover:text-foreground group-hover/sidebar:opacity-100 group-hover/sidebar:pointer-events-auto dark:text-white/50 dark:hover:bg-white/[0.07] dark:hover:text-white"
            onClick={toggleAllGroups}
            aria-label={groupsToggleLabel}
            title={groupsToggleLabel}
          >
            {anyGroupExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
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
