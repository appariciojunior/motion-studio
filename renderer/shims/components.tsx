/**
 * Browser shims for @glaze/core/components
 * Provides lightweight versions of the Glaze UI components used in Motion Studio.
 */
import * as React from "react";
import { Tooltip, Select as RadixSelect, Slider as RadixSlider, Switch as RadixSwitch } from "radix-ui";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...args: Parameters<typeof clsx>) => twMerge(clsx(...args));

// ---------------------------------------------------------------------------
// TooltipProvider
// ---------------------------------------------------------------------------
export const TooltipProvider = Tooltip.Provider;

// ---------------------------------------------------------------------------
// Toaster - simple notification container (no-op for now)
// ---------------------------------------------------------------------------
export function Toaster() {
  return null;
}

// ---------------------------------------------------------------------------
// Status - small status badge
// ---------------------------------------------------------------------------
interface StatusProps {
  variant?: "error" | "warning" | "success" | "info";
  children?: React.ReactNode;
  className?: string;
}

export function Status({ variant = "info", children, className }: StatusProps) {
  const colors = {
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        colors[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glass" | "accent" | "muted" | "filled" | "default";
  size?: "small" | "medium" | "large";
  iconOnly?: boolean;
  children?: React.ReactNode;
}

export function Button({ variant = "default", size = "medium", iconOnly = false, className, children, ...props }: ButtonProps) {
  const variantClasses = {
    glass:
      "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/[0.12] dark:border-white/20 text-foreground backdrop-blur-sm",
    accent: "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
    muted:
      "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-foreground",
    filled: "bg-foreground text-background hover:opacity-90 border-transparent",
    default:
      "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-foreground",
  };
  const sizeClasses = {
    small: "h-6 px-2 text-xs gap-1",
    medium: "h-8 px-3 text-sm gap-1.5",
    large: "h-10 px-4 text-sm gap-2",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors border",
        "disabled:pointer-events-none disabled:opacity-50 cursor-default",
        variantClasses[variant],
        sizeClasses[size],
        iconOnly && (size === "small" ? "w-6 px-0" : size === "medium" ? "w-8 px-0" : "w-10 px-0"),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------
interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Separator({ className, orientation = "horizontal" }: SeparatorProps) {
  return (
    <div
      className={cn(
        "shrink-0 bg-black/10 dark:bg-white/10",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className,
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export function Sidebar({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "h-full flex flex-col overflow-hidden bg-black/[0.045] dark:bg-white/3 border-r border-black/[0.12] dark:border-white/8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarList({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("sidebar-scroll flex-1 overflow-y-auto py-2", className)}>
      {children}
    </div>
  );
}

interface SidebarListGroupProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function SidebarListGroup({ title, children, className, collapsed = false, onToggle }: SidebarListGroupProps) {
  return (
    <div className={cn("mt-4 mb-1 first:mt-0", className)}>
      <button
        type="button"
        className="group flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-black/55 transition-colors hover:text-foreground dark:text-white/40"
        aria-expanded={!collapsed}
        onClick={onToggle}
      >
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <span
          className={cn(
            "text-[10px] leading-none transition-transform text-black/45 dark:text-white/35",
            collapsed ? "rotate-90" : "rotate-0",
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {!collapsed && <div>{children}</div>}
    </div>
  );
}

interface SidebarListItemProps {
  title: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarListItem({ title, icon, selected, onClick, className }: SidebarListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm cursor-default transition-colors",
        selected
          ? "bg-blue-500/14 text-blue-700 dark:text-blue-400 font-medium"
          : "text-black/[0.78] dark:text-white/70 hover:bg-black/[0.07] dark:hover:bg-white/5 hover:text-foreground",
        className,
      )}
    >
      {icon && <span className="shrink-0 opacity-70">{icon}</span>}
      <span className="truncate">{title}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SplitView — 3-pane layout: sidebar | main content | inspector
// ---------------------------------------------------------------------------
interface PaneSize {
  default: number;
  min?: number;
  max?: number;
}

interface SplitViewProps {
  sidebar?: React.ReactNode;
  sidebarSize?: PaneSize;
  inspector?: React.ReactNode;
  inspectorSize?: PaneSize;
  children?: React.ReactNode;
  className?: string;
  storageKey?: string;
}

export function SplitView({
  sidebar,
  sidebarSize = { default: 220 },
  inspector,
  inspectorSize = { default: 300 },
  children,
  className,
}: SplitViewProps) {
  return (
    <div className={cn("flex h-full overflow-hidden", className)}>
      {sidebar && (
        <div
          style={{ width: sidebarSize.default, minWidth: sidebarSize.min, maxWidth: sidebarSize.max }}
          className="shrink-0 h-full overflow-hidden"
        >
          {sidebar}
        </div>
      )}
      <div className="flex-1 min-w-0 h-full overflow-hidden">{children}</div>
      {inspector && (
        <div
          style={{ width: inspectorSize.default, minWidth: inspectorSize.min, maxWidth: inspectorSize.max }}
          className="shrink-0 h-full overflow-hidden border-l border-black/[0.12] dark:border-white/8"
        >
          {inspector}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
interface ToolbarProps {
  position?: "top" | "bottom";
  children?: React.ReactNode;
  className?: string;
}

export function Toolbar({ position = "top", children, className }: ToolbarProps) {
  return (
    <div
      data-toolbar
      className={cn(
        "flex flex-col shrink-0 border-black/[0.12] dark:border-white/8 bg-black/[0.035] dark:bg-white/2",
        position === "top" ? "border-b" : "border-t",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToolbarRow({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 px-2 h-10", className)}>
      {children}
    </div>
  );
}

export function ToolbarTitle({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("flex-1 font-medium text-sm truncate px-1", className)}>
      {children}
    </span>
  );
}

export function ToolbarActions({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 ml-auto", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ErrorBoundaryView
// ---------------------------------------------------------------------------
interface ErrorBoundaryViewProps {
  error?: Error;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundaryView extends React.Component<ErrorBoundaryViewProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryViewProps) {
    super(props);
    this.state = { error: props.error ?? null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    const error = this.state.error ?? this.props.error;
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
          <p className="font-semibold text-lg">Something went wrong</p>
          <pre className="text-xs text-red-500 max-w-md whitespace-pre-wrap">{error.message}</pre>
          <button
            className="text-sm underline opacity-60"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Slider — wraps Radix Slider
// ---------------------------------------------------------------------------
interface SliderProps {
  "aria-label"?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  variant?: string;
  size?: string;
  className?: string;
}

export function Slider({ "aria-label": ariaLabel, min, max, step, value, onValueChange, className }: SliderProps) {
  return (
    <RadixSlider.Root
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      className={cn("relative flex items-center select-none touch-none w-full h-5", className)}
    >
      <RadixSlider.Track className="bg-black/10 dark:bg-white/10 relative grow rounded-full h-1.5">
        <RadixSlider.Range className="absolute bg-blue-500 rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        aria-label={ariaLabel}
        className="block w-4 h-4 bg-white dark:bg-neutral-200 shadow-md rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </RadixSlider.Root>
  );
}

// ---------------------------------------------------------------------------
// Switch — wraps Radix Switch
// ---------------------------------------------------------------------------
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export function Switch({ checked, onCheckedChange, className }: SwitchProps) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-default items-center rounded-md border border-separator p-0.5",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        checked ? "bg-blue-500" : "bg-black/5 dark:bg-white/10",
        className,
      )}
    >
      <RadixSwitch.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-sm bg-white shadow-sm ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </RadixSwitch.Root>
  );
}

// ---------------------------------------------------------------------------
// Select family — wraps Radix Select
// ---------------------------------------------------------------------------
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      {children}
    </RadixSelect.Root>
  );
}

interface SelectTriggerProps {
  size?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  return (
    <RadixSelect.Trigger
      className={cn(
        "flex h-7 w-full items-center justify-between rounded-md border border-black/10 dark:border-white/10",
        "bg-white/50 dark:bg-white/5 px-2.5 py-1 text-xs shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50",
        "gap-1",
        className,
      )}
    >
      {children}
      <RadixSelect.Icon className="opacity-40">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <RadixSelect.Value placeholder={placeholder} />;
}

export function SelectContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-black/10 dark:border-white/15",
          "bg-white dark:bg-neutral-900 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        position="popper"
        sideOffset={4}
      >
        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export function SelectItem({ value, children, className }: { value: string; children?: React.ReactNode; className?: string }) {
  return (
    <RadixSelect.Item
      value={value}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-6 pr-2 text-xs",
        "focus:bg-blue-50 dark:focus:bg-blue-950 focus:text-blue-600 dark:focus:text-blue-400 outline-none",
        className,
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

// ---------------------------------------------------------------------------
// SegmentedControl — custom (no Radix equivalent)
// ---------------------------------------------------------------------------
interface SegmentedControlProps {
  type?: "single";
  size?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function SegmentedControl({ value, onValueChange, children, className }: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg p-0.5 bg-black/8 dark:bg-white/8",
        className,
      )}
      role="group"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<SegmentedControlItemProps>(child)) {
          return React.cloneElement(child, {
            _selected: child.props.value === value,
            _onSelect: onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

interface SegmentedControlItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  _selected?: boolean;
  _onSelect?: (value: string) => void;
}

export function SegmentedControlItem({ value, children, className, _selected, _onSelect }: SegmentedControlItemProps) {
  return (
    <button
      role="radio"
      aria-checked={_selected}
      onClick={() => _onSelect?.(value)}
      className={cn(
        "flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-default",
        _selected
          ? "bg-white dark:bg-neutral-700 shadow-sm text-foreground"
          : "text-black/50 dark:text-white/50 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dialog family — uses native <dialog> element
// ---------------------------------------------------------------------------
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const DialogContext = React.createContext<{ onClose: () => void }>({ onClose: () => {} });

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const onClose = () => onOpenChange?.(false);
  if (!open) return null;
  return (
    <DialogContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/[0.38] dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10">{children}</div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-black/[0.14] dark:border-white/10",
        "w-[90vw] max-w-lg max-h-[85vh] flex flex-col overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center px-5 py-4 border-b border-black/[0.12] dark:border-white/8 shrink-0", className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <h2 className={cn("font-semibold text-sm", className)}>{children}</h2>;
}

export function DialogBody({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-auto p-5", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-2 px-5 py-3 border-t border-black/[0.12] dark:border-white/8 shrink-0", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs family
// ---------------------------------------------------------------------------
interface TabsRootProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{ value: string; onChange: (v: string) => void }>({
  value: "",
  onChange: () => {},
});

export function TabsRoot({ value = "", onValueChange, children, className }: TabsRootProps) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange ?? (() => {}) }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function Tabs({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div role="tablist" className={cn("flex items-center gap-0.5 p-1 bg-black/5 dark:bg-white/5 rounded-lg", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children?: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  const selected = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "flex-1 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-default",
        selected
          ? "bg-white dark:bg-neutral-700 shadow-sm"
          : "text-black/50 dark:text-white/50 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------
export function EmptyState({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-12 text-center px-6", className)}>
      {children}
    </div>
  );
}

export function EmptyStateTitle({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <p className={cn("font-medium text-sm", className)}>{children}</p>;
}

export function EmptyStateDescription({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <p className={cn("text-xs text-black/50 dark:text-white/50 max-w-xs", className)}>{children}</p>;
}
