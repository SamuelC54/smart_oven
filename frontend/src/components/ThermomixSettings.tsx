import { useState } from "react";
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

interface ThermomixSettingsProps {
  onBack: () => void;
  onSave: (settings: any) => void;
}

export function ThermomixSettings({ onBack, onSave }: ThermomixSettingsProps) {
  const [settings, setSettings] = useState({
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

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
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
    { value: "conventional", label: "Conventional Heat", icon: "🔥" },
    { value: "convection", label: "Convection Fan", icon: "🌪️" },
    { value: "grill", label: "Grill Mode", icon: "🔥" },
    { value: "steam", label: "Steam Cook", icon: "💨" },
    { value: "combination", label: "Combo Mode", icon: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              className="w-12 h-12 rounded-full border-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-medium text-gray-800">
              Oven Settings
            </h1>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="rounded-2xl border-2 px-6"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => onSave(settings)}
              className="rounded-2xl px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cooking Mode */}
          <Card className="p-8 rounded-3xl border-2 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-medium text-gray-800">
                Cooking Mode
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cookingModes.map((mode) => (
                <Button
                  key={mode.value}
                  variant={
                    settings.cookingMode === mode.value ? "default" : "outline"
                  }
                  onClick={() => handleSettingChange("cookingMode", mode.value)}
                  className="h-20 rounded-2xl border-2 flex-col gap-2"
                >
                  <span className="text-2xl">{mode.icon}</span>
                  <span className="text-sm font-medium">{mode.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Temperature & Power */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-800">
                  Temperature
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    Temperature Unit
                  </span>
                  <Select
                    value={settings.temperatureUnit}
                    onValueChange={(value) =>
                      handleSettingChange("temperatureUnit", value)
                    }
                  >
                    <SelectTrigger className="w-24 rounded-xl">
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
                    <span className="text-gray-700 font-medium">
                      Auto Preheat
                    </span>
                    <p className="text-sm text-gray-500">
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

            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Wind className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-800">
                  Fan Control
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-medium">Fan Speed</span>
                    <span className="text-lg font-bold text-blue-600">
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
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sound & Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-800">Sound</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-700 font-medium">
                      Alert Sounds
                    </span>
                    <p className="text-sm text-gray-500">
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
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700 font-medium">Volume</span>
                      <span className="text-lg font-bold text-green-600">
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
                      className="h-3"
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-800">Display</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-medium">
                      Brightness
                    </span>
                    <span className="text-lg font-bold text-yellow-600">
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
                    className="h-3"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-700 font-medium">
                      Night Mode
                    </span>
                    <p className="text-sm text-gray-500">Reduce blue light</p>
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
          </div>

          {/* Safety */}
          <Card className="p-6 rounded-3xl border-2 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">
                Safety & Control
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700 font-medium">Child Lock</span>
                  <p className="text-sm text-gray-500">Prevent accidents</p>
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
                  <span className="text-gray-700 font-medium">
                    Auto Shutoff
                  </span>
                  <p className="text-sm text-gray-500">Auto stop when done</p>
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
                  <span className="text-gray-700 font-medium">Oven Light</span>
                  <p className="text-sm text-gray-500">Interior lighting</p>
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
    </div>
  );
}
