import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerData, Hull, Gun } from '@/lib/gameTypes';
import { HULLS, GUNS, getUpgradeCost, getUpgradedStats } from '@/lib/gameData';
import { ArrowLeft, Coins, Shield, Zap, Heart, Crosshair, Timer, Flame, Lock, Check, ArrowUp } from 'lucide-react';

interface GarageProps {
  playerData: PlayerData | null;
  onBack: () => void;
  onBuyHull: (hullId: string) => void;
  onBuyGun: (gunId: string) => void;
  onUpgradeHull: (hullId: string) => void;
  onUpgradeGun: (gunId: string) => void;
  onEquipHull: (hullId: string) => void;
  onEquipGun: (gunId: string) => void;
}

type Tab = 'hulls' | 'guns';

export const Garage = ({
  playerData,
  onBack,
  onBuyHull,
  onBuyGun,
  onUpgradeHull,
  onUpgradeGun,
  onEquipHull,
  onEquipGun,
}: GarageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('hulls');
  const [selectedHull, setSelectedHull] = useState<string | null>(playerData?.equippedHull || null);
  const [selectedGun, setSelectedGun] = useState<string | null>(playerData?.equippedGun || null);

  const ownedHulls = playerData?.ownedHulls || [];
  const ownedGuns = playerData?.ownedGuns || [];
  const hullUpgrades = playerData?.hullUpgrades || {};
  const gunUpgrades = playerData?.gunUpgrades || {};

  const isHullOwned = (id: string) => ownedHulls.includes(id);
  const isGunOwned = (id: string) => ownedGuns.includes(id);
  const getHullLevel = (id: string) => hullUpgrades[id] || 0;
  const getGunLevel = (id: string) => gunUpgrades[id] || 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-primary/5" />
      <div className="absolute inset-0 scanline pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          
          <h1 className="font-orbitron text-4xl font-bold text-glow-gold text-gold">
            GARAGE
          </h1>
          
          <div className="flex items-center gap-2 bg-card/60 px-4 py-2 rounded-lg border border-border">
            <Coins className="w-5 h-5 text-gold" />
            <span className="font-orbitron text-gold text-xl">{playerData?.money?.toLocaleString() ?? 0}</span>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'hulls' ? 'military' : 'secondary'}
            size="lg"
            onClick={() => setActiveTab('hulls')}
            className="flex-1"
          >
            <Shield className="w-5 h-5 mr-2" />
            HULLS
          </Button>
          <Button
            variant={activeTab === 'guns' ? 'military' : 'secondary'}
            size="lg"
            onClick={() => setActiveTab('guns')}
            className="flex-1"
          >
            <Crosshair className="w-5 h-5 mr-2" />
            GUNS
          </Button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
            {activeTab === 'hulls' ? (
              HULLS.map((hull) => (
                <HullCard
                  key={hull.id}
                  hull={hull}
                  isOwned={isHullOwned(hull.id)}
                  isEquipped={playerData?.equippedHull === hull.id}
                  upgradeLevel={getHullLevel(hull.id)}
                  isSelected={selectedHull === hull.id}
                  canAfford={(playerData?.money ?? 0) >= hull.price}
                  canAffordUpgrade={(playerData?.money ?? 0) >= getUpgradeCost(getHullLevel(hull.id))}
                  onSelect={() => setSelectedHull(hull.id)}
                  onBuy={() => onBuyHull(hull.id)}
                  onUpgrade={() => onUpgradeHull(hull.id)}
                  onEquip={() => onEquipHull(hull.id)}
                />
              ))
            ) : (
              GUNS.map((gun) => (
                <GunCard
                  key={gun.id}
                  gun={gun}
                  isOwned={isGunOwned(gun.id)}
                  isEquipped={playerData?.equippedGun === gun.id}
                  upgradeLevel={getGunLevel(gun.id)}
                  isSelected={selectedGun === gun.id}
                  canAfford={(playerData?.money ?? 0) >= gun.price}
                  canAffordUpgrade={(playerData?.money ?? 0) >= getUpgradeCost(getGunLevel(gun.id))}
                  onSelect={() => setSelectedGun(gun.id)}
                  onBuy={() => onBuyGun(gun.id)}
                  onUpgrade={() => onUpgradeGun(gun.id)}
                  onEquip={() => onEquipGun(gun.id)}
                />
              ))
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6">
            <h3 className="font-orbitron text-xl mb-4 text-foreground">PREVIEW</h3>
            <div className="aspect-square bg-secondary/30 rounded-lg flex items-center justify-center mb-4 border border-border">
              {activeTab === 'hulls' && selectedHull && (
                <TankPreview hull={HULLS.find(h => h.id === selectedHull)!} upgradeLevel={getHullLevel(selectedHull)} />
              )}
              {activeTab === 'guns' && selectedGun && (
                <GunPreview gun={GUNS.find(g => g.id === selectedGun)!} upgradeLevel={getGunLevel(selectedGun)} />
              )}
              {((activeTab === 'hulls' && !selectedHull) || (activeTab === 'guns' && !selectedGun)) && (
                <p className="text-muted-foreground">Select an item</p>
              )}
            </div>
            
            {/* Selected Item Stats */}
            {activeTab === 'hulls' && selectedHull && (
              <HullStats hull={HULLS.find(h => h.id === selectedHull)!} upgradeLevel={getHullLevel(selectedHull)} />
            )}
            {activeTab === 'guns' && selectedGun && (
              <GunStats gun={GUNS.find(g => g.id === selectedGun)!} upgradeLevel={getGunLevel(selectedGun)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hull Card Component
const HullCard = ({
  hull,
  isOwned,
  isEquipped,
  upgradeLevel,
  isSelected,
  canAfford,
  canAffordUpgrade,
  onSelect,
  onBuy,
  onUpgrade,
  onEquip,
}: {
  hull: Hull;
  isOwned: boolean;
  isEquipped: boolean;
  upgradeLevel: number;
  isSelected: boolean;
  canAfford: boolean;
  canAffordUpgrade: boolean;
  onSelect: () => void;
  onBuy: () => void;
  onUpgrade: () => void;
  onEquip: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`bg-card/60 backdrop-blur-sm border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 ${
      isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'
    } ${isEquipped ? 'ring-2 ring-gold ring-offset-2 ring-offset-background' : ''}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-orbitron text-lg text-foreground">{hull.name}</h4>
        {isOwned && (
          <span className="text-sm text-primary font-medium">M{upgradeLevel}</span>
        )}
      </div>
      <div
        className="w-8 h-8 rounded-full border-2"
        style={{ backgroundColor: hull.color, borderColor: hull.color }}
      />
    </div>
    
    <p className="text-muted-foreground text-sm mb-4">{hull.description}</p>
    
    <div className="flex gap-2">
      {!isOwned ? (
        <Button
          variant={canAfford ? 'gold' : 'secondary'}
          size="sm"
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onBuy(); }}
          disabled={!canAfford}
        >
          {hull.price === 0 ? (
            'FREE'
          ) : (
            <>
              <Coins className="w-4 h-4 mr-1" />
              {hull.price.toLocaleString()}
            </>
          )}
        </Button>
      ) : (
        <>
          {upgradeLevel < 20 && (
            <Button
              variant={canAffordUpgrade ? 'military' : 'secondary'}
              size="sm"
              onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
              disabled={!canAffordUpgrade}
            >
              <ArrowUp className="w-4 h-4 mr-1" />
              {getUpgradeCost(upgradeLevel).toLocaleString()}
            </Button>
          )}
          <Button
            variant={isEquipped ? 'gold' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onEquip(); }}
            disabled={isEquipped}
          >
            {isEquipped ? <Check className="w-4 h-4 mr-1" /> : null}
            {isEquipped ? 'EQUIPPED' : 'EQUIP'}
          </Button>
        </>
      )}
    </div>
  </div>
);

// Gun Card Component
const GunCard = ({
  gun,
  isOwned,
  isEquipped,
  upgradeLevel,
  isSelected,
  canAfford,
  canAffordUpgrade,
  onSelect,
  onBuy,
  onUpgrade,
  onEquip,
}: {
  gun: Gun;
  isOwned: boolean;
  isEquipped: boolean;
  upgradeLevel: number;
  isSelected: boolean;
  canAfford: boolean;
  canAffordUpgrade: boolean;
  onSelect: () => void;
  onBuy: () => void;
  onUpgrade: () => void;
  onEquip: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`bg-card/60 backdrop-blur-sm border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 ${
      isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'
    } ${isEquipped ? 'ring-2 ring-gold ring-offset-2 ring-offset-background' : ''}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-orbitron text-lg text-foreground">{gun.name}</h4>
        {isOwned && (
          <span className="text-sm text-primary font-medium">M{upgradeLevel}</span>
        )}
      </div>
      <div
        className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
        style={{ backgroundColor: gun.shotColor + '30', borderColor: gun.shotColor }}
      >
        <Flame className="w-4 h-4" style={{ color: gun.shotColor }} />
      </div>
    </div>
    
    <p className="text-muted-foreground text-sm mb-2">{gun.description}</p>
    <p className="text-xs text-primary mb-4 uppercase tracking-wider">{gun.shotEffect} shot</p>
    
    <div className="flex gap-2">
      {!isOwned ? (
        <Button
          variant={canAfford ? 'gold' : 'secondary'}
          size="sm"
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onBuy(); }}
          disabled={!canAfford}
        >
          {gun.price === 0 ? (
            'FREE'
          ) : (
            <>
              <Coins className="w-4 h-4 mr-1" />
              {gun.price.toLocaleString()}
            </>
          )}
        </Button>
      ) : (
        <>
          {upgradeLevel < 20 && (
            <Button
              variant={canAffordUpgrade ? 'military' : 'secondary'}
              size="sm"
              onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
              disabled={!canAffordUpgrade}
            >
              <ArrowUp className="w-4 h-4 mr-1" />
              {getUpgradeCost(upgradeLevel).toLocaleString()}
            </Button>
          )}
          <Button
            variant={isEquipped ? 'gold' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onEquip(); }}
            disabled={isEquipped}
          >
            {isEquipped ? <Check className="w-4 h-4 mr-1" /> : null}
            {isEquipped ? 'EQUIPPED' : 'EQUIP'}
          </Button>
        </>
      )}
    </div>
  </div>
);

// Tank Preview
const TankPreview = ({ hull, upgradeLevel }: { hull: Hull; upgradeLevel: number }) => (
  <div className="text-center">
    <div
      className="w-24 h-32 mx-auto mb-4 rounded-lg border-4 animate-tank-idle"
      style={{ 
        backgroundColor: hull.color + '40',
        borderColor: hull.color,
        boxShadow: `0 0 20px ${hull.color}60`
      }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <Shield className="w-12 h-12" style={{ color: hull.color }} />
      </div>
    </div>
    <p className="font-orbitron text-lg text-foreground">{hull.name}</p>
    <p className="text-primary font-medium">M{upgradeLevel}</p>
  </div>
);

// Gun Preview
const GunPreview = ({ gun, upgradeLevel }: { gun: Gun; upgradeLevel: number }) => (
  <div className="text-center">
    <div
      className="w-32 h-16 mx-auto mb-4 rounded-lg border-4 flex items-center justify-center"
      style={{ 
        backgroundColor: gun.shotColor + '20',
        borderColor: gun.shotColor,
        boxShadow: `0 0 20px ${gun.shotColor}40`
      }}
    >
      <div className="w-20 h-6 rounded-full" style={{ backgroundColor: gun.shotColor }} />
    </div>
    <p className="font-orbitron text-lg text-foreground">{gun.name}</p>
    <p className="text-primary font-medium">M{upgradeLevel}</p>
  </div>
);

// Hull Stats
const HullStats = ({ hull, upgradeLevel }: { hull: Hull; upgradeLevel: number }) => (
  <div className="space-y-3">
    <StatBar
      icon={<Heart className="w-4 h-4" />}
      label="Health"
      value={getUpgradedStats(hull.baseHealth, upgradeLevel)}
      max={5000}
      color="text-destructive"
      barColor="bg-destructive"
    />
    <StatBar
      icon={<Zap className="w-4 h-4" />}
      label="Speed"
      value={getUpgradedStats(hull.baseSpeed, upgradeLevel)}
      max={20}
      color="text-gold"
      barColor="bg-gold"
    />
    <StatBar
      icon={<Shield className="w-4 h-4" />}
      label="Armor"
      value={getUpgradedStats(hull.baseArmor, upgradeLevel)}
      max={100}
      color="text-primary"
      barColor="bg-primary"
    />
  </div>
);

// Gun Stats
const GunStats = ({ gun, upgradeLevel }: { gun: Gun; upgradeLevel: number }) => (
  <div className="space-y-3">
    <StatBar
      icon={<Flame className="w-4 h-4" />}
      label="Damage"
      value={getUpgradedStats(gun.baseDamage, upgradeLevel)}
      max={600}
      color="text-destructive"
      barColor="bg-destructive"
    />
    <StatBar
      icon={<Zap className="w-4 h-4" />}
      label="Fire Rate"
      value={gun.fireRate}
      max={12}
      color="text-gold"
      barColor="bg-gold"
    />
    <StatBar
      icon={<Timer className="w-4 h-4" />}
      label="Reload"
      value={Math.max(50, gun.reloadTime - upgradeLevel * 20)}
      max={2500}
      color="text-ally"
      barColor="bg-ally"
      inverted
    />
  </div>
);

// Stat Bar
const StatBar = ({
  icon,
  label,
  value,
  max,
  color,
  barColor,
  inverted = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
  color: string;
  barColor: string;
  inverted?: boolean;
}) => {
  const percentage = inverted ? ((max - value) / max) * 100 : (value / max) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className={`flex items-center gap-2 ${color}`}>
          {icon}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="font-orbitron text-sm text-foreground">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
};
