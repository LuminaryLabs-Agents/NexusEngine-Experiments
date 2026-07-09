import assert from 'node:assert/strict';
import { createZombieOrchardRadioFenceRescueReadinessDomainKit } from '../experiments/zombie-orchard/src/radio-fence-rescue-readiness-kits.js';
const cases=[
{seed:'cold-start',round:1,pressure:.15,health:100,stamina:90,apples:1,ammo:0,survivors:1,rescued:0,barricadesBuilt:0,beaconsPowered:0,flaresReady:0},
{seed:'early-horde',round:2,pressure:.32,health:92,stamina:84,apples:2,ammo:3,survivors:2,rescued:0,barricadesBuilt:1,beaconsPowered:1,flaresReady:0},
{seed:'radio-online',round:3,pressure:.4,health:88,stamina:76,apples:5,ammo:8,survivors:3,rescued:1,barricadesBuilt:2,beaconsPowered:2,flaresReady:1},
{seed:'flare-net',round:4,pressure:.5,health:80,stamina:69,apples:6,ammo:9,survivors:4,rescued:1,barricadesBuilt:3,beaconsPowered:2,flaresReady:3},
{seed:'survivor-line',round:5,pressure:.57,health:76,stamina:65,apples:8,ammo:12,survivors:5,rescued:2,barricadesBuilt:4,beaconsPowered:3,flaresReady:3},
{seed:'night-breach',round:6,pressure:.78,health:61,stamina:54,apples:3,ammo:4,survivors:4,rescued:1,barricadesBuilt:2,beaconsPowered:1,flaresReady:1},
{seed:'perimeter-hold',round:7,pressure:.67,health:72,stamina:58,apples:9,ammo:16,survivors:6,rescued:3,barricadesBuilt:6,beaconsPowered:3,flaresReady:4},
{seed:'convoy-ready',round:8,pressure:.43,health:86,stamina:74,apples:12,ammo:20,survivors:6,rescued:5,barricadesBuilt:7,beaconsPowered:5,flaresReady:5},
{seed:'last-family',round:9,pressure:.52,health:90,stamina:80,apples:14,ammo:18,survivors:7,rescued:6,barricadesBuilt:8,beaconsPowered:5,flaresReady:6},
{seed:'dusk-secured',round:10,pressure:.28,health:96,stamina:90,apples:18,ammo:24,survivors:8,rescued:8,barricadesBuilt:9,beaconsPowered:6,flaresReady:6}
];
const domain=createZombieOrchardRadioFenceRescueReadinessDomainKit({seed:'test-radio-fence'});
assert.equal(domain.id,'zombie-orchard-radio-fence-rescue-readiness-domain-kit');
assert.equal(domain.domainTree.id,'zombie-orchard-radio-fence-rescue-readiness-domain');
assert.ok(domain.ownershipExclusions.includes('renderer'));
for(const [index,item] of cases.entries()){const result=domain.compose(item);assert.equal(result.id,'zombie-orchard-radio-fence-rescue-readiness');assert.ok(result.summary.readinessScore>=0&&result.summary.readinessScore<=1,`case ${index} readiness bounded`);assert.match(result.summary.missionState,/convoy-ready|perimeter-forming|breach-imminent|hold-the-fence|route-survivors/);assert.equal(result.rendererHandoff.passId,'radio-fence-rescue-readiness-renderer-handoff-pass');assert.ok(result.rendererHandoff.counts.watchtowerMasts>=3);assert.ok(result.rendererHandoff.counts.radioBeacons>=2);assert.ok(result.rendererHandoff.counts.thornBarricadeLanes>=3);assert.ok(result.rendererHandoff.counts.flareTripwires>=2);assert.ok(result.rendererHandoff.counts.survivorStretcherHandoffs>=1);assert.equal(result.rendererHandoff.counts.duskPerimeterLedgers,1);assert.equal(result.rendererHandoff.flatDescriptors.length,result.rendererHandoff.counts.total);assert.doesNotThrow(()=>JSON.stringify(result));assert.ok(result.rendererHandoff.flatDescriptors.every(d=>d.rendererHints.consumes==='descriptor-only'))}
assert.ok(domain.compose(cases.at(-1)).summary.readinessScore>domain.compose(cases[0]).summary.readinessScore);
console.log('Zombie Orchard radio fence rescue readiness kits smoke passed 10 intake cases.');
