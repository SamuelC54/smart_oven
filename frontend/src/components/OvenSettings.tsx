import React, { useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { 
  Thermometer, 
  Clock, 
  Droplets, 
  Volume2, 
  Lightbulb, 
  Shield, 
  Wifi, 
  Settings,
  Save,
  RotateCcw
} from "lucide-react";

interface OvenSettingsProps {
  onBack: () => void;
  onSave: (settings: any) => void;
}

export function OvenSettings({ onBack, onSave }: OvenSettingsProps) {
  const [settings, setSettings] = useState({
    // Temperature Settings
    targetTemperature: 180,
    temperatureUnit: 'celsius',
    preheating: true,
    
    // Timer Settings
    cookTime: { hours: 1, minutes: 30 },
    alertSound: true,
    alertVolume: 75,
    
    // Cooking Modes
    cookingMode: 'conventional',
    fanSpeed: 50,
    steamLevel: 25,
    
    // Safety & Maintenance
    childLock: false,
    autoShutoff: true,
    ovenLight: true,
    
    // Connectivity
    wifiEnabled: true,
    notifications: true,
    
    // Display
    brightness: 80,
    nightMode: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    setSettings(prev => ({
      ...prev,
      cookTime: {
        ...prev.cookTime,
        [type]: parseInt(value) || 0
      }
    }));
  };

  const resetToDefaults = () => {
    setSettings({
      targetTemperature: 180,
      temperatureUnit: 'celsius',
      preheating: true,
      cookTime: { hours: 1, minutes: 30 },
      alertSound: true,
      alertVolume: 75,
      cookingMode: 'conventional',
      fanSpeed: 50,
      steamLevel: 25,
      childLock: false,
      autoShutoff: true,
      ovenLight: true,
      wifiEnabled: true,
      notifications: true,
      brightness: 80,
      nightMode: false
    });
  };

  const cookingModes = [
    { value: 'conventional', label: 'Conventional' },
    { value: 'convection', label: 'Convection' },
    { value: 'grill', label: 'Grill' },
    { value: 'steam', label: 'Steam' },
    { value: 'combination', label: 'Combination' }
  ];

  return (
    <div className="p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-medium">Oven Settings</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={() => onSave(settings)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-medium">Temperature</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="target-temp">Target Temperature</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  id="target-temp"
                  type="number"
                  value={settings.targetTemperature}
                  onChange={(e) => handleSettingChange('targetTemperature', parseInt(e.target.value))}
                  className="w-24"
                />
                <Select 
                  value={settings.temperatureUnit} 
                  onValueChange={(value) => handleSettingChange('temperatureUnit', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">°C</SelectItem>
                    <SelectItem value="fahrenheit">°F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="preheating">Auto Preheating</Label>
              <Switch
                id="preheating"
                checked={settings.preheating}
                onCheckedChange={(checked) => handleSettingChange('preheating', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Timer Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-medium">Timer</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Cook Time</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="number"
                  placeholder="Hours"
                  value={settings.cookTime.hours}
                  onChange={(e) => handleTimeChange('hours', e.target.value)}
                  className="w-20"
                />
                <span>h</span>
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={settings.cookTime.minutes}
                  onChange={(e) => handleTimeChange('minutes', e.target.value)}
                  className="w-20"
                />
                <span>m</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="alert-sound">Alert Sound</Label>
              <Switch
                id="alert-sound"
                checked={settings.alertSound}
                onCheckedChange={(checked) => handleSettingChange('alertSound', checked)}
              />
            </div>
            {settings.alertSound && (
              <div>
                <Label>Volume: {settings.alertVolume}%</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Volume2 className="w-4 h-4" />
                  <Slider
                    value={[settings.alertVolume]}
                    onValueChange={([value]) => handleSettingChange('alertVolume', value)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Cooking Modes */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-medium">Cooking Mode</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cooking-mode">Mode</Label>
              <Select 
                value={settings.cookingMode} 
                onValueChange={(value) => handleSettingChange('cookingMode', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cookingModes.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fan Speed: {settings.fanSpeed}%</Label>
              <Slider
                value={[settings.fanSpeed]}
                onValueChange={([value]) => handleSettingChange('fanSpeed', value)}
                max={100}
                step={10}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Steam Level: {settings.steamLevel}%</Label>
              <Slider
                value={[settings.steamLevel]}
                onValueChange={([value]) => handleSettingChange('steamLevel', value)}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Safety & Controls */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-medium">Safety & Controls</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="child-lock">Child Lock</Label>
                <p className="text-sm text-gray-600">Prevent accidental operation</p>
              </div>
              <Switch
                id="child-lock"
                checked={settings.childLock}
                onCheckedChange={(checked) => handleSettingChange('childLock', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-shutoff">Auto Shutoff</Label>
                <p className="text-sm text-gray-600">Turn off after cooking completes</p>
              </div>
              <Switch
                id="auto-shutoff"
                checked={settings.autoShutoff}
                onCheckedChange={(checked) => handleSettingChange('autoShutoff', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <Label htmlFor="oven-light">Oven Light</Label>
              </div>
              <Switch
                id="oven-light"
                checked={settings.ovenLight}
                onCheckedChange={(checked) => handleSettingChange('ovenLight', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Connectivity */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-medium">Connectivity</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="wifi">WiFi Connection</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Connected to Kitchen_WiFi
                  </Badge>
                </div>
              </div>
              <Switch
                id="wifi"
                checked={settings.wifiEnabled}
                onCheckedChange={(checked) => handleSettingChange('wifiEnabled', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Smart Notifications</Label>
                <p className="text-sm text-gray-600">Receive alerts on your phone</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-medium">Display</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Screen Brightness: {settings.brightness}%</Label>
              <Slider
                value={[settings.brightness]}
                onValueChange={([value]) => handleSettingChange('brightness', value)}
                max={100}
                step={10}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="night-mode">Night Mode</Label>
                <p className="text-sm text-gray-600">Reduce blue light emission</p>
              </div>
              <Switch
                id="night-mode"
                checked={settings.nightMode}
                onCheckedChange={(checked) => handleSettingChange('nightMode', checked)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}