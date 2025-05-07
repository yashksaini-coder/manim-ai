import { ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <>
      {/* No header here - this layout will inherit from the root layout */}
      {/* but we're not rendering the Header component in these chat pages */}
      <div className="pt-0">
        {children}
      </div>
    </>
  );
}
  