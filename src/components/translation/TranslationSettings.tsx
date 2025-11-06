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
    <div className="space-y-6">
      {/* Translation Quality */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Translation Quality
            <HelpTooltip content="Higher quality settings provide more accurate translations and better text rendering, but may take longer to process." />
          </CardTitle>
          <CardDescription>
            Choose the quality level for translation processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.quality}
            onValueChange={(value) => updateSetting("quality", value as TranslationQuality)}
            disabled={disabled}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 space-y-0 rounded-lg border-2 border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="standard" id="quality-standard" className="mt-0.5" />
              <Label htmlFor="quality-standard" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Standard</div>
                    <div className="text-sm text-muted-foreground">
                      Fast translation with good quality
                    </div>
                  </div>
                  <Badge variant="outline">Fast</Badge>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0 rounded-lg border-2 border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="premium" id="quality-premium" className="mt-0.5" />
              <Label htmlFor="quality-premium" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Premium</div>
                    <div className="text-sm text-muted-foreground">
                      Enhanced accuracy and better text rendering
                    </div>
                  </div>
                  <Badge variant="default" className="bg-primary">Recommended</Badge>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0 rounded-lg border-2 border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="ultra" id="quality-ultra" className="mt-0.5" />
              <Label htmlFor="quality-ultra" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Ultra</div>
                    <div className="text-sm text-muted-foreground">
                      Maximum quality with perfect text matching
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary text-primary">Best</Badge>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Font Matching */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Font Matching
            <HelpTooltip content="Controls how the translated text fonts are matched to the original. Auto tries to find similar fonts, Preserve keeps original fonts, Native uses target language fonts." />
          </CardTitle>
          <CardDescription>
            How should fonts be matched in the translated image?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.fontMatching}
            onValueChange={(value) => updateSetting("fontMatching", value as FontMatching)}
            disabled={disabled}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="auto" id="font-auto" className="peer sr-only" />
              <Label
                htmlFor="font-auto"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-semibold text-sm mb-1">Auto Match</div>
                <div className="text-xs text-muted-foreground text-center">
                  AI finds similar fonts
                </div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="preserve" id="font-preserve" className="peer sr-only" />
              <Label
                htmlFor="font-preserve"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-semibold text-sm mb-1">Preserve Original</div>
                <div className="text-xs text-muted-foreground text-center">
                  Keep original fonts
                </div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="native" id="font-native" className="peer sr-only" />
              <Label
                htmlFor="font-native"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-semibold text-sm mb-1">Native Fonts</div>
                <div className="text-xs text-muted-foreground text-center">
                  Use target language fonts
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Text Style */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Text Style
            <HelpTooltip content="Exact preserves original text style exactly, Natural adapts to target language conventions, Adaptive balances both approaches." />
          </CardTitle>
          <CardDescription>
            How should the text style be handled?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.textStyle}
            onValueChange={(value) => updateSetting("textStyle", value as TextStyle)}
            disabled={disabled}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="exact" id="style-exact" className="peer sr-only" />
              <Label
                htmlFor="style-exact"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-semibold text-sm mb-1">Exact Match</div>
                <div className="text-xs text-muted-foreground text-center">
                  Preserve original style
                </div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="natural" id="style-natural" className="peer sr-only" />
              <Label
                htmlFor="style-natural"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-semibold text-sm mb-1">Natural</div>
                <div className="text-xs text-muted-foreground text-center">
                  Adapt to language
                </div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="adaptive" id="style-adaptive" className="peer sr-only" />
              <Label
                htmlFor="style-adaptive"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="font-semibold text-sm mb-1">Adaptive</div>
                <div className="text-xs text-muted-foreground text-center">
                  Balance both
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Advanced Options
          </CardTitle>
          <CardDescription>
            Fine-tune translation behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="preserve-formatting" className="text-base font-medium cursor-pointer">
                Preserve Formatting
              </Label>
              <p className="text-sm text-muted-foreground">
                Keep original text formatting (bold, italic, colors, sizes)
              </p>
            </div>
            <Checkbox
              id="preserve-formatting"
              checked={settings.preserveFormatting}
              onCheckedChange={(checked) => updateSetting("preserveFormatting", checked as boolean)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="enhance-readability" className="text-base font-medium cursor-pointer">
                Enhance Readability
              </Label>
              <p className="text-sm text-muted-foreground">
                Optimize text spacing and layout for better readability in target language
              </p>
            </div>
            <Checkbox
              id="enhance-readability"
              checked={settings.enhanceReadability}
              onCheckedChange={(checked) => updateSetting("enhanceReadability", checked as boolean)}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

