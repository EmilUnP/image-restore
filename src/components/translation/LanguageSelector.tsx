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
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          Target Language
          <HelpTooltip content="Choose the language you want to translate the text in your image to. The AI will detect and translate all text while preserving the original image quality and style." />
        </CardTitle>
        <CardDescription>
          Select the language you want to translate the text to
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="language-select">Language</Label>
          <Select
            value={language}
            onValueChange={onLanguageChange}
            disabled={disabled}
          >
            <SelectTrigger id="language-select" className="w-full">
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
          <p className="text-xs text-muted-foreground mt-2">
            The text in your image will be translated to <strong>{LANGUAGES.find(l => l.code === language)?.name || 'the selected language'}</strong> while preserving the original image quality and style.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

