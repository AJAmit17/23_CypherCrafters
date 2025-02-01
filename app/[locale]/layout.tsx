import { unstable_setRequestLocale } from "next-intl/server";

const locales = ["en", "de", "kn-IN", "hi-IN"];

export const dynamic = "force-dynamic";

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function Layout({
  children,
  params: { locale },
}: Readonly<RootLayoutProps>) {
  unstable_setRequestLocale(locale);
  return <>{children}</>;
}
