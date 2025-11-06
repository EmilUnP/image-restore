import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import { HelpTooltip } from "@/components/shared/HelpTooltip";

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

export const LanguageSelector = ({
  language,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) => {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          Target Language
          <HelpTooltip content="Choose the language you want to translate the text in your image to. The AI will detect and translate all text while preserving the original image quality and style." />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="space-y-1.5">
          <Select
            value={language}
            onValueChange={onLanguageChange}
            disabled={disabled}
          >
            <SelectTrigger id="language-select" className="w-full h-9 text-sm">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Translating to <strong>{LANGUAGES.find(l => l.code === language)?.name || 'selected language'}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

