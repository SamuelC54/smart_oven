import { useAtom } from "jotai";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Thermometer,
  Volume2,
  Lightbulb,
  Shield,
  Save,
  RotateCcw,
  Zap,
  Wind,
} from "lucide-react";
import { ovenSettingsAtom, type OvenSettings } from "../store/atoms";

interface OvenSettingsProps {
  onBack: () => void;
  onSave: (settings: Record<string, unknown>) => void;
}

export function OvenSettings({ onBack, onSave }: OvenSettingsProps) {
  const [settings, setSettings] = useAtom(ovenSettingsAtom);

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings((prev: OvenSettings) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetToDefaults = () => {
    setSettings({
      temperatureUnit: "celsius",
      preheating: true,
      alertSound: true,
      alertVolume: 75,
      cookingMode: "conventional",
      fanSpeed: 50,
      childLock: false,
      autoShutoff: true,
      ovenLight: true,
      brightness: 80,
      nightMode: false,
    });
  };

  const cookingModes = [
    { value: "conventional", label: "Conventional", icon: "🔥" },
    { value: "convection", label: "Convection", icon: "🌪️" },
    { value: "grill", label: "Grill", icon: "🔥" },
    { value: "steam", label: "Steam", icon: "💨" },
    { value: "combination", label: "Combo", icon: "⚡" },
  ];

  return (
    <div className="h-full flex flex-col p-3 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="w-10 h-10 rounded-full border-2 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-medium text-gray-800">Settings</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="rounded-xl border-2 px-3 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={() => onSave(settings)}
            className="rounded-xl px-3 text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Cooking Mode */}
        <Card className="p-4 rounded-2xl border-2 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-800">Cooking Mode</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {cookingModes.map((mode) => (
              <Button
                key={mode.value}
                variant={
                  settings.cookingMode === mode.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleSettingChange("cookingMode", mode.value)}
                className="h-12 rounded-xl border flex-col gap-1 text-xs"
              >
                <span className="text-base">{mode.icon}</span>
                <span>{mode.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Temperature Settings */}
        <Card className="p-4 rounded-2xl border-2 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Temperature</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Unit</span>
              <Select
                value={settings.temperatureUnit}
                onValueChange={(value) =>
                  handleSettingChange("temperatureUnit", value)
                }
              >
                <SelectTrigger className="w-16 h-8 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">°C</SelectItem>
                  <SelectItem value="fahrenheit">°F</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Auto Preheat
                </span>
                <p className="text-xs text-gray-500">
                  Start heating automatically
                </p>
              </div>
              <Switch
                checked={settings.preheating}
                onCheckedChange={(checked) =>
                  handleSettingChange("preheating", checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Fan Control */}
        <Card className="p-4 rounded-2xl border-2 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wind className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Fan Control</h3>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700 font-medium">
                Fan Speed
              </span>
              <span className="text-sm font-bold text-blue-600">
                {settings.fanSpeed}%
              </span>
            </div>
            <Slider
              value={[settings.fanSpeed]}
              onValueChange={([value]) =>
                handleSettingChange("fanSpeed", value)
              }
              max={100}
              step={10}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </Card>

        {/* Sound Settings */}
        <Card className="p-4 rounded-2xl border-2 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Sound</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Alert Sounds
                </span>
                <p className="text-xs text-gray-500">
                  Cooking completion alerts
                </p>
              </div>
              <Switch
                checked={settings.alertSound}
                onCheckedChange={(checked) =>
                  handleSettingChange("alertSound", checked)
                }
              />
            </div>

            {settings.alertSound && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700 font-medium">
                    Volume
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {settings.alertVolume}%
                  </span>
                </div>
                <Slider
                  value={[settings.alertVolume]}
                  onValueChange={([value]) =>
                    handleSettingChange("alertVolume", value)
                  }
                  max={100}
                  step={5}
                  className="h-2"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="p-4 rounded-2xl border-2 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Display</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700 font-medium">
                  Brightness
                </span>
                <span className="text-sm font-bold text-yellow-600">
                  {settings.brightness}%
                </span>
              </div>
              <Slider
                value={[settings.brightness]}
                onValueChange={([value]) =>
                  handleSettingChange("brightness", value)
                }
                max={100}
                step={10}
                className="h-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Night Mode
                </span>
                <p className="text-xs text-gray-500">Reduce blue light</p>
              </div>
              <Switch
                checked={settings.nightMode}
                onCheckedChange={(checked) =>
                  handleSettingChange("nightMode", checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Safety Settings */}
        <Card className="p-4 rounded-2xl border-2 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Safety</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Child Lock
                </span>
                <p className="text-xs text-gray-500">Prevent accidents</p>
              </div>
              <Switch
                checked={settings.childLock}
                onCheckedChange={(checked) =>
                  handleSettingChange("childLock", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Auto Shutoff
                </span>
                <p className="text-xs text-gray-500">Auto stop when done</p>
              </div>
              <Switch
                checked={settings.autoShutoff}
                onCheckedChange={(checked) =>
                  handleSettingChange("autoShutoff", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Oven Light
                </span>
                <p className="text-xs text-gray-500">Interior lighting</p>
              </div>
              <Switch
                checked={settings.ovenLight}
                onCheckedChange={(checked) =>
                  handleSettingChange("ovenLight", checked)
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
