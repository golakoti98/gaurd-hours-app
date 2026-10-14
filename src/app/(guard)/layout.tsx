import { BottomNav } from "@/components/BottomNav";

export default function GuardLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="mx-auto min-h-full max-w-lg px-4 pb-24 pt-6">{children}</div>
      <BottomNav />
    </>
  );
}
