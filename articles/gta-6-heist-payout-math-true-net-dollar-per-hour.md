---
title: "GTA 6 Heist Payout Math: Calculating True Net $/Hour After Setup Time, Cooldowns & Fence Laundering Fees"
published: true
description: "Why headline gross payouts mislead heist crews—and how to calculate realistic Net $/Hour across all 6 Leonida vaults after setup grind, 48-minute cooldowns, hired NPC cuts, and fence laundering fees."
tags: gta6, gaming, javascript, webdev
canonical_url: https://www.gta6heistguide.com/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html
---

# GTA 6 Heist Payout Math: Calculating True Net $/Hour After Setup Time, Cooldowns & Fence Laundering Fees

Every time a new heist target is revealed, guides focus on the headline gross take—like **$25,000,000** for the **Leonida State Gold Reserve** or **$14,500,000** for **Sinfrontera National Bank**. But experienced heist leaders know that gross take is a vanity metric. What actually determines how fast you build your criminal empire in Leonida is **True Net $/Hour**.

You can run the interactive math right now in our **[Free GTA 6 Heist True $/Hour Calculator & 15s Vault Hack Trainer](https://www.gta6heistguide.com/free/)**.

### The Complete True Net $/Hour Formula

To model realistic take-home pay per hour across 1 to 4 players, our calculator at **[gta6heistguide.com](https://www.gta6heistguide.com/)** uses:

```text
Gross_Adjusted = Base_Payout * (1 + Stealth_Bonus_0.05) * (Weekly_Bonus_1.5_if_active)
After_NPC_Cut  = Gross_Adjusted * (1 - (Gunner% + Hacker% + Driver%) / 100)
Clean_Squad_Pot = After_NPC_Cut * (1 - Fence_Laundering_Fee% / 100) * (1 - Public_Lobby_Fail_Penalty% / 100)
Player_Net_Take = Clean_Squad_Pot * (Player_Share% / 100)
True_Net_Per_Hour = Player_Net_Take / ((Setup_Minutes + Finale_Minutes + Cooldown_Minutes) / 60)
```

### Benchmark Net $/Hour Table Across All 6 Leonida Vaults

| Vault Target | Gross Base | Setup + Run | Cooldown | NPC + Fence Fee | 2P Duo Net $/Hr (50/50) | 4P Equal Net $/Hr (25%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Leonida State Gold Reserve** | $25,000,000 | 77m | 48m | 28% | **$4,320,000/hr** | $2,160,000/hr |
| **Sinfrontera National Bank** | $14,500,000 | 54m | 45m | 26% | **$3,251,000/hr** | $1,625,500/hr |
| **Grassrivers Airstrip (1.5X Week)** | $9,750,000 | 38m | 30m | 22% | **$3,355,000/hr** | $1,677,500/hr |
| **Ocean Drive Armored Convoy** | $9,400,000 | 35m | 30m | 24% | **$3,297,000/hr** | $1,648,500/hr |
| **Starlet Superyacht Offshore** | $11,800,000 | 56m | 45m | 25% | **$2,628,000/hr** | $1,314,000/hr |
| **Port Gellhorn Container Heist** | $8,200,000 | 45m | 35m | 24% | **$2,337,000/hr** | $1,168,500/hr |

### 3 High-Impact Optimizations

1. **Drop Hired NPC Drivers for a Human Wheelman:** Hiring an AI getaway driver deducts 8%–12% off the top. Recruiting a human Wheelman on our **[Verified Day-1 LFG Squad Board](https://www.gta6heistguide.com/forum#lfg-hub)** keeps 100% of that cut inside your squad.
2. **Route Through a 6% Vice City Nightclub Shell:** Instant dock fences charge 12%–15% laundering fees. Routing through Boobie Ike's Vice City nightclub fronts drops the fee to 6% ([Safehouses & Laundering Guide](https://www.gta6heistguide.com/safehouses-laundering)).
3. **Protect Your Finale Host IP & Clip Runs Offline:** Never lose a $25M finale to a peer-to-peer DDoS drop—use **[NordVPN's Low-Ping Tunnel](https://nordvpn.com/)**, stream Vice City on a **[Samsung 990 PRO Gen4 SSD](https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20)**, and auto-cut your heist VODs into 9:16 shorts offline with **[CutFlow Pro & ClipBounty Studio](https://getapexlocal.com)** ([Whop Store](https://whop.com/apexlocallabs/products/)).
