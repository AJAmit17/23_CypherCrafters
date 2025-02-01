"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
// import GoogleTranslator from "./shared/translator";

export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localeActive = useLocale();

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      const currentPath = window.location.pathname;
      const localeRegex = new RegExp(`^/(${localeActive}|en|kn-IN|hi-IN)`);
      const newPath = currentPath.replace(localeRegex, `/${nextLocale}`);

      router.push(newPath);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="border-2 rounded py-2" disabled={isPending}>
          {localeActive === "en" ? "English" : localeActive === "kn-IN" ? "Kannada" : "Hindi"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => onSelectChange("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelectChange("kn-IN")}>Kannada</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelectChange("hi-IN")}>Hindi</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    // <div>
    //   <GoogleTranslator />
    // </div>
  );
}
