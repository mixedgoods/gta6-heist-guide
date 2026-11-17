#!/usr/bin/env node
const { calculateNetPerHour } = require('./index');
const res = calculateNetPerHour({ vaultSlug: process.argv[2] || 'leonida-reserve', players: Number(process.argv[3] || 2) });
console.log(JSON.stringify(res, null, 2));
console.log('Run interactive 15s Vault Hack Trainer & Map at: https://www.gta6heistguide.com/free/');
