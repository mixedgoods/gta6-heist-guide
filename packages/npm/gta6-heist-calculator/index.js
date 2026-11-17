/**
 * gta6-heist-calculator v3.0.0
 * Official companion math library for https://www.gta6heistguide.com/free/
 */
const LEONIDA_VAULTS = {
  'leonida-reserve': { name: 'Leonida State Gold Reserve', region: 'Ambrosia', basePayout: 25000000, setupMins: 77, cooldownMins: 48 },
  'sinfrontera-bank': { name: 'Sinfrontera National Bank', region: 'Vice City', basePayout: 14500000, setupMins: 54, cooldownMins: 45 },
  'vice-city-yacht-heist': { name: 'Starlet Superyacht Offshore', region: 'Leonida Keys', basePayout: 11800000, setupMins: 56, cooldownMins: 45 },
  'ocean-drive-armored-convoy': { name: 'Ocean Drive Armored Convoy', region: 'Vice City', basePayout: 9400000, setupMins: 35, cooldownMins: 30 },
  'port-gellhorn': { name: 'Port Gellhorn Container Terminal', region: 'Port Gellhorn', basePayout: 8200000, setupMins: 45, cooldownMins: 35 },
  'everglades-smuggler-run': { name: 'Grassrivers Cartel Airstrip', region: 'Grassrivers', basePayout: 6500000, setupMins: 38, cooldownMins: 30 }
};

function calculateNetPerHour({
  vaultSlug = 'leonida-reserve',
  players = 4,
  npcCutPct = 25,
  fenceFeePct = 8,
  stealthBonus = true,
  weeklyBonus = false
} = {}) {
  const v = LEONIDA_VAULTS[vaultSlug] || LEONIDA_VAULTS['leonida-reserve'];
  const gross = v.basePayout * (stealthBonus ? 1.05 : 1.0) * (weeklyBonus ? 1.5 : 1.0);
  const netPot = gross * (1 - npcCutPct / 100) * (1 - fenceFeePct / 100);
  const perPlayerNet = netPot / Math.max(1, players);
  const totalMins = v.setupMins + v.cooldownMins;
  const netPerHour = perPlayerNet / (totalMins / 60);
  return {
    vault: v.name,
    region: v.region,
    gross: Math.round(gross),
    netPot: Math.round(netPot),
    perPlayerNet: Math.round(perPlayerNet),
    netPerHour: Math.round(netPerHour),
    netPerMinute: Math.round(perPlayerNet / totalMins),
    interactiveToolUrl: 'https://www.gta6heistguide.com/free/'
  };
}

module.exports = { LEONIDA_VAULTS, calculateNetPerHour };
