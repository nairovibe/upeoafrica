import { LogoMark } from "@/components/brand/Logo";

export function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ink-950 text-white">
      <div className="relative hidden w-[42%] overflow-hidden lg:block">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <LogoMark size={96} priority />
          <div>
            <p className="font-display text-3xl font-semibold leading-tight">
              The company desk.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <LogoMark size={56} priority />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
