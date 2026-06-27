import { Sidebar, SidebarList, SidebarListGroup, SidebarListItem } from "@glaze/core/components";
import { Sparkles } from "lucide-react";
import { libraryGroups } from "../lib/library";

interface EffectSidebarProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function EffectSidebar({ selectedId, onSelect }: EffectSidebarProps) {
  const groups = libraryGroups();
  return (
    <Sidebar>
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-black/[0.08] px-3 dark:border-white/8">
        <span className="flex size-5 items-center justify-center rounded-md bg-blue-500 text-white shadow-sm shadow-blue-500/20">
          <Sparkles size={13} />
        </span>
        <span className="text-sm font-semibold tracking-tight text-foreground">Motion Studio</span>
      </div>
      <SidebarList>
        {groups.map((group) => (
          <SidebarListGroup key={group.title} title={group.title}>
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
