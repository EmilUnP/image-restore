import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Type, Palette, Sparkles } from "lucide-react";
import { HelpTooltip } from "@/components/shared/HelpTooltip";

export type TranslationQuality = "standard" | "premium" | "ultra";
export type FontMatching = "auto" | "preserve" | "native";
export type TextStyle = "exact" | "natural" | "adaptive";

export interface TranslationSettings {
  quality: TranslationQuality;
  fontMatching: FontMatching;
  textStyle: TextStyle;
  preserveFormatting: boolean;
  enhanceReadability: boolean;
}

interface TranslationSettingsProps {
  settings: TranslationSettings;
  onSettingsChange: (settings: TranslationSettings) => void;
  disabled?: boolean;
}

export const TranslationSettingsComponent = ({
  settings,
  onSettingsChange,
  disabled = false,
}: TranslationSettingsProps) => {
  const updateSetting = <K extends keyof TranslationSettings>(
    key: K,
    value: TranslationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-3">
      {/* Translation Quality - Compact horizontal layout */}
      <Card className="border-border/60">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            Translation Quality
            <HelpTooltip content="Higher quality settings provide more accurate translations and better text rendering, but may take longer to process." />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <RadioGroup
            value={settings.quality}
            onValueChange={(value) => updateSetting("quality", value as TranslationQuality)}
            disabled={disabled}
            className="grid grid-cols-3 gap-2"
          >
            <div>
              <RadioGroupItem value="standard" id="quality-standard" className="peer sr-only" />
              <Label
                htmlFor="quality-standard"
                className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2.5 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-medium text-xs">Standard</div>
                <Badge variant="outline" className="text-[10px] mt-1 px-1.5 py-0">Fast</Badge>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="premium" id="quality-premium" className="peer sr-only" />
              <Label
                htmlFor="quality-premium"
                className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2.5 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-medium text-xs">Premium</div>
                <Badge variant="default" className="bg-primary text-[10px] mt-1 px-1.5 py-0">Rec</Badge>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="ultra" id="quality-ultra" className="peer sr-only" />
              <Label
                htmlFor="quality-ultra"
                className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2.5 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-medium text-xs">Ultra</div>
                <Badge variant="outline" className="border-primary text-primary text-[10px] mt-1 px-1.5 py-0">Best</Badge>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Font Matching & Text Style - Side by side */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              Font Matching
              <HelpTooltip content="Controls how the translated text fonts are matched to the original. Auto tries to find similar fonts, Preserve keeps original fonts, Native uses target language fonts." />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <RadioGroup
              value={settings.fontMatching}
              onValueChange={(value) => updateSetting("fontMatching", value as FontMatching)}
              disabled={disabled}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="auto" id="font-auto" className="peer sr-only" />
                <Label
                  htmlFor="font-auto"
                  className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="font-medium text-xs text-center leading-tight">Auto</div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="preserve" id="font-preserve" className="peer sr-only" />
                <Label
                  htmlFor="font-preserve"
                  className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="font-medium text-xs text-center leading-tight">Preserve</div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="native" id="font-native" className="peer sr-only" />
                <Label
                  htmlFor="font-native"
                  className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="font-medium text-xs text-center leading-tight">Native</div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              Text Style
              <HelpTooltip content="Exact preserves original text style exactly, Natural adapts to target language conventions, Adaptive balances both approaches." />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <RadioGroup
              value={settings.textStyle}
              onValueChange={(value) => updateSetting("textStyle", value as TextStyle)}
              disabled={disabled}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="exact" id="style-exact" className="peer sr-only" />
                <Label
                  htmlFor="style-exact"
                  className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="font-medium text-xs text-center leading-tight">Exact</div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="natural" id="style-natural" className="peer sr-only" />
                <Label
                  htmlFor="style-natural"
                  className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="font-medium text-xs text-center leading-tight">Natural</div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="adaptive" id="style-adaptive" className="peer sr-only" />
                <Label
                  htmlFor="style-adaptive"
                  className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="font-medium text-xs text-center leading-tight">Adaptive</div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Options - Compact horizontal layout */}
      <Card className="border-border/60">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            Advanced Options
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:bg-accent/50 transition-colors gap-2">
              <Label htmlFor="preserve-formatting" className="text-xs font-medium cursor-pointer flex-1">
                Preserve Formatting
              </Label>
              <Checkbox
                id="preserve-formatting"
                checked={settings.preserveFormatting}
                onCheckedChange={(checked) => updateSetting("preserveFormatting", checked as boolean)}
                disabled={disabled}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:bg-accent/50 transition-colors gap-2">
              <Label htmlFor="enhance-readability" className="text-xs font-medium cursor-pointer flex-1">
                Enhance Readability
              </Label>
              <Checkbox
                id="enhance-readability"
                checked={settings.enhanceReadability}
                onCheckedChange={(checked) => updateSetting("enhanceReadability", checked as boolean)}
                disabled={disabled}
                className="h-4 w-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

