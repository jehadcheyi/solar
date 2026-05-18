import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  BatteryCharging,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Download,
  Factory,
  Gauge,
  Globe2,
  Grid2X2,
  Info,
  Laptop,
  LineChart as LineChartIcon,
  Play,
  RotateCcw,
  ShieldCheck,
  Sun,
  ToggleLeft,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './styles.css';

type Lang = 'ku' | 'en';
type LoadType = 'AC' | 'DC';
type Severity = 'pass' | 'warn' | 'fail' | 'info';

type LoadItem = {
  id: string;
  nameKu: string;
  nameEn: string;
  type: LoadType;
  watts: number;
  qty: number;
  hours: number;
  surge: number;
};

type City = {
  id: string;
  ku: string;
  en: string;
  psh: number;
  summerTemp: number;
  noteKu: string;
  noteEn: string;
};

type PvModule = {
  id: string;
  brand: string;
  model: string;
  watts: number;
  vmp: number;
  voc: number;
  imp: number;
  tempPowerCoeff: number;
  tempVocCoeff: number;
  marketKu: string;
  marketEn: string;
};

type BatteryModel = {
  id: string;
  brand: string;
  model: string;
  voltage: number;
  ah: number;
  dod: number;
  efficiency: number;
  chemistry: string;
};

type InverterModel = {
  id: string;
  brand: string;
  model: string;
  dcVoltage: number;
  acWatts: number;
  surgeWatts: number;
  efficiency: number;
  type: string;
};

type MpptModel = {
  id: string;
  brand: string;
  model: string;
  batteryVoltage: number;
  maxPvVoc: number;
  amps: number;
  efficiency: number;
};

type Inputs = {
  lang: Lang;
  projectName: string;
  cityId: string;
  pshOverride: number;
  usePshOverride: boolean;
  ambientTemp: number;
  irradiance: number;
  soilingLossPct: number;
  shadowLossPct: number;
  wiringLossPct: number;
  safetyMarginPct: number;
  backupHours: number;
  batteryVoltage: number;
  panelId: string;
  panelCount: number;
  panelsPerString: number;
  batteryId: string;
  batteryCount: number;
  inverterId: string;
  mpptId: string;
  hasDcBreaker: boolean;
  hasAcBreaker: boolean;
  hasSpd: boolean;
  hasEarthing: boolean;
};

type Check = {
  severity: Severity;
  ku: string;
  en: string;
  fixKu: string;
  fixEn: string;
  math?: string;
};

type Simulation = {
  city: City;
  panel: PvModule;
  battery: BatteryModel;
  inverter: InverterModel;
  mppt: MpptModel;
  dailyLoadWh: number;
  peakAcW: number;
  peakDcW: number;
  peakTotalW: number;
  surgeAcW: number;
  psh: number;
  cellTempC: number;
  strings: number;
  stcArrayW: number;
  tempFactor: number;
  environmentFactor: number;
  effectiveArrayW: number;
  stringVmp: number;
  stringVoc: number;
  arrayImp: number;
  dailyPvWh: number;
  batteryNominalWh: number;
  batteryUsableWh: number;
  autonomyHours: number;
  inverterLoadPct: number;
  inverterSurgePct: number;
  mpptRequiredA: number;
  energyBalanceWh: number;
  recommendedPanels: number;
  recommendedBatteries: number;
  recommendedInverterW: number;
  recommendedMpptA: number;
  score: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  checks: Check[];
  hourly: { hour: string; pv: number; load: number; battery: number }[];
  ivCurve: { voltage: number; current: number; power: number }[];
  lossData: { name: string; value: number }[];
};

const t = {
  ku: {
    app: 'SolarLab PV Emulator Pro',
    subtitle: 'سیمولاتەرا پیشەیی یا لابوراتوارا سولارێ — دهۆک / کوردستان',
    switch: 'English',
    safety: 'ئەم سیستمە تەنها بۆ فێربوون و سیمولاشنێیە. دامەزراندنا راستەقینە یا سولارێ پێدڤی بە پسپۆر، دیتاشیت، چێککرنا سایتێ، protection و یاسایێن کارەبایێ هەیە.',
    workflow: 'ڕێکخستنا پڕۆژە',
    loads: 'لیستا باران',
    lab: 'نەخشەیا لابوراتوارێ',
    market: 'بازارا عێراق / کوردستانێ',
    result: 'ئەنجام و چێک',
    charts: 'گراف و کەروێن PV',
    formulas: 'فۆرمولە و راپۆرت',
    auto: 'دیزاینا خۆکار',
    simulate: 'سیمولاشن بکە',
    reset: 'Reset',
    export: 'راپۆرتێ داگرتن',
    print: 'Print',
    notCertified: 'هەژمارەکان ل ناڤ مودێلا فێربوونێدا یەکسان و ڕوونن، بەڵام ئەمە نەرمەفزارا پەسەندکراوی ئەندازیاری نینە.',
  },
  en: {
    app: 'SolarLab PV Emulator Pro',
    subtitle: 'Professional solar lab simulator — Duhok / Kurdistan',
    switch: 'کوردی Badini',
    safety: 'Educational simulation only. Real solar installation needs qualified supervision, datasheets, site checks, protection design, and local electrical code compliance.',
    workflow: 'Project setup',
    loads: 'Load schedule',
    lab: 'Laboratory schematic',
    market: 'Iraq / Kurdistan market',
    result: 'Result & checks',
    charts: 'Charts & PV curves',
    formulas: 'Formulas & report',
    auto: 'Auto design',
    simulate: 'Run simulation',
    reset: 'Reset',
    export: 'Export report',
    print: 'Print',
    notCertified: 'The math is consistent inside this educational model, but this is not certified engineering design software.',
  },
};

const cities: City[] = [
  { id: 'duhok', ku: 'دهۆک', en: 'Duhok', psh: 5.2, summerTemp: 42, noteKu: 'هاڤین گەرم و تۆز؛ پاکژکرنا پانێلان و تهویه گرنگن.', noteEn: 'Hot dusty summer; cleaning and ventilation matter.' },
  { id: 'erbil', ku: 'هەولێر', en: 'Erbil', psh: 5.4, summerTemp: 43, noteKu: 'بازارا گەورەتر؛ براند زۆرتر، تۆز و گەرمی هەنە.', noteEn: 'Large market; more brands, dust and heat.' },
  { id: 'sulaymaniyah', ku: 'سلێمانی', en: 'Sulaymaniyah', psh: 5.0, summerTemp: 39, noteKu: 'کەمێ ساردتر؛ زۆرجار پرفۆرمانسێ باتری و inverter باشترە.', noteEn: 'Slightly cooler; battery/inverter performance may be better.' },
  { id: 'zakho', ku: 'زاخۆ', en: 'Zakho', psh: 5.3, summerTemp: 42, noteKu: 'پڕیسێتا ناڤچەیا دهۆکێ.', noteEn: 'Duhok-region preset.' },
  { id: 'baghdad', ku: 'بەغدا', en: 'Baghdad', psh: 5.7, summerTemp: 46, noteKu: 'گەرمی و تۆز زیادتر؛ derating پێدڤیە.', noteEn: 'Higher heat and dust; derating is essential.' },
  { id: 'basra', ku: 'بەسرە', en: 'Basra', psh: 5.8, summerTemp: 48, noteKu: 'گەرمی زۆر؛ باتری ل ژێر سایە و تهویه باش پێدڤیە.', noteEn: 'Very hot; batteries need shade and ventilation.' },
];

const panels: PvModule[] = [
  { id: 'jinko-620', brand: 'Jinko', model: 'N-Type 620W training module', watts: 620, vmp: 41.5, voc: 49.5, imp: 14.95, tempPowerCoeff: -0.003, tempVocCoeff: -0.0025, marketKu: 'نموونەی بازاری: Jinko ل عێراق/کوردستانێ زۆر دەبینرێت.', marketEn: 'Market example: Jinko is commonly seen in Iraq/Kurdistan.' },
  { id: 'longi-585', brand: 'LONGi', model: 'Hi-MO style 585W training module', watts: 585, vmp: 43.2, voc: 51.8, imp: 13.55, tempPowerCoeff: -0.0034, tempVocCoeff: -0.0026, marketKu: 'نموونەی بازاری: LONGi براندەکا جیهانی و ل بازارێدا بەردەستە.', marketEn: 'Market example: LONGi is a global brand available in the market.' },
  { id: 'canadian-550', brand: 'Canadian Solar', model: '550W training module', watts: 550, vmp: 41.9, voc: 49.6, imp: 13.13, tempPowerCoeff: -0.0035, tempVocCoeff: -0.0028, marketKu: 'نموونەی بازاری: Canadian Solar ل عێراق هاتیە ئاماژەدان.', marketEn: 'Market example: Canadian Solar is referenced in Iraq distribution.' },
  { id: 'trina-550', brand: 'Trina', model: '550W training module', watts: 550, vmp: 41.7, voc: 49.4, imp: 13.2, tempPowerCoeff: -0.0034, tempVocCoeff: -0.0027, marketKu: 'نموونەی براندێ جیهانی بۆ مەشقێ.', marketEn: 'Global brand example for training.' },
];

const batteries: BatteryModel[] = [
  { id: 'svolt-51-100', brand: 'SVOLT', model: '51.2V 100Ah LiFePO4', voltage: 51.2, ah: 100, dod: 0.9, efficiency: 0.95, chemistry: 'LiFePO4' },
  { id: 'gsl-51-200', brand: 'GSL / Rack lithium', model: '51.2V 200Ah LiFePO4', voltage: 51.2, ah: 200, dod: 0.9, efficiency: 0.95, chemistry: 'LiFePO4' },
  { id: 'long-12-200', brand: 'LONG / Tubular class', model: '12V 200Ah tubular', voltage: 12, ah: 200, dod: 0.5, efficiency: 0.82, chemistry: 'Tubular Lead-Acid' },
  { id: 'eastman-12-250', brand: 'Eastman / ADDO class', model: '12V 250Ah tubular', voltage: 12, ah: 250, dod: 0.5, efficiency: 0.82, chemistry: 'Tubular Lead-Acid' },
];

const inverters: InverterModel[] = [
  { id: 'deye-8k', brand: 'Deye', model: 'Hybrid 8kW class', dcVoltage: 48, acWatts: 8000, surgeWatts: 16000, efficiency: 0.96, type: 'Hybrid inverter' },
  { id: 'growatt-6k', brand: 'Growatt', model: '6kW hybrid class', dcVoltage: 48, acWatts: 6000, surgeWatts: 12000, efficiency: 0.95, type: 'Hybrid inverter' },
  { id: 'luxpower-5k', brand: 'Luxpower / similar', model: '5kW hybrid class', dcVoltage: 48, acWatts: 5000, surgeWatts: 10000, efficiency: 0.94, type: 'Hybrid inverter' },
  { id: 'sulir-3k', brand: 'Sulir / off-grid class', model: '3kW off-grid class', dcVoltage: 24, acWatts: 3000, surgeWatts: 6000, efficiency: 0.91, type: 'Off-grid inverter' },
];

const mppts: MpptModel[] = [
  { id: 'mppt-60-150', brand: 'MPPT generic', model: '60A / 150V', batteryVoltage: 48, maxPvVoc: 150, amps: 60, efficiency: 0.96 },
  { id: 'mppt-100-250', brand: 'MPPT generic', model: '100A / 250V', batteryVoltage: 48, maxPvVoc: 250, amps: 100, efficiency: 0.97 },
  { id: 'hybrid-internal-450', brand: 'Hybrid internal', model: 'Internal MPPT 450V class', batteryVoltage: 48, maxPvVoc: 450, amps: 120, efficiency: 0.97 },
  { id: 'pwm-40', brand: 'PWM generic', model: '40A PWM training only', batteryVoltage: 24, maxPvVoc: 100, amps: 40, efficiency: 0.82 },
];

const defaultLoads: LoadItem[] = [
  { id: 'led', nameKu: 'LED چرای', nameEn: 'LED lights', type: 'AC', watts: 10, qty: 10, hours: 6, surge: 1 },
  { id: 'fan', nameKu: 'پەنگا', nameEn: 'Fans', type: 'AC', watts: 60, qty: 3, hours: 8, surge: 1.2 },
  { id: 'tv', nameKu: 'TV', nameEn: 'TV', type: 'AC', watts: 120, qty: 1, hours: 5, surge: 1.1 },
  { id: 'fridge', nameKu: 'سەلاجە', nameEn: 'Refrigerator', type: 'AC', watts: 300, qty: 1, hours: 10, surge: 3 },
  { id: 'pump', nameKu: 'مۆتۆرا ئاڤێ', nameEn: 'Water pump', type: 'AC', watts: 750, qty: 1, hours: 1, surge: 3 },
];

const numberFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const kwh = (wh: number) => `${numberFmt.format(wh / 1000)} kWh`;
const w = (value: number) => `${Math.round(value).toLocaleString()} W`;
const a = (value: number) => `${numberFmt.format(value)} A`;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function calculate(loads: LoadItem[], inputs: Inputs): Simulation {
  const city = cities.find((c) => c.id === inputs.cityId) ?? cities[0];
  const panel = panels.find((p) => p.id === inputs.panelId) ?? panels[0];
  const battery = batteries.find((b) => b.id === inputs.batteryId) ?? batteries[0];
  const inverter = inverters.find((i) => i.id === inputs.inverterId) ?? inverters[0];
  const mppt = mppts.find((m) => m.id === inputs.mpptId) ?? mppts[0];
  const psh = inputs.usePshOverride ? inputs.pshOverride : city.psh;

  const dailyLoadWh = loads.reduce((s, item) => s + item.watts * item.qty * item.hours, 0);
  const peakAcW = loads.filter((x) => x.type === 'AC').reduce((s, item) => s + item.watts * item.qty, 0);
  const peakDcW = loads.filter((x) => x.type === 'DC').reduce((s, item) => s + item.watts * item.qty, 0);
  const peakTotalW = peakAcW + peakDcW;
  const surgeAcW = loads.filter((x) => x.type === 'AC').reduce((s, item) => s + item.watts * item.qty * item.surge, 0);

  const series = Math.max(1, Math.min(inputs.panelsPerString, inputs.panelCount));
  const strings = Math.max(1, Math.ceil(inputs.panelCount / series));
  const stcArrayW = inputs.panelCount * panel.watts;
  const cellTempC = inputs.ambientTemp + (inputs.irradiance / 800) * 20;
  const tempFactor = Math.max(0, 1 + panel.tempPowerCoeff * (cellTempC - 25));
  const environmentFactor = clamp((inputs.irradiance / 1000) * (1 - inputs.soilingLossPct / 100) * (1 - inputs.shadowLossPct / 100) * (1 - inputs.wiringLossPct / 100), 0, 1.3);
  const effectiveArrayW = stcArrayW * tempFactor * environmentFactor;
  const voltageTempFactor = Math.max(0.2, 1 + panel.tempVocCoeff * (cellTempC - 25));
  const stringVmp = panel.vmp * series * voltageTempFactor;
  const stringVoc = panel.voc * series * voltageTempFactor;
  const arrayImp = panel.imp * strings * (inputs.irradiance / 1000) * (1 - inputs.shadowLossPct / 100);
  const dailyPvWh = effectiveArrayW * psh * mppt.efficiency * inverter.efficiency;

  const batteryNominalWh = battery.voltage * battery.ah * inputs.batteryCount;
  const batteryUsableWh = batteryNominalWh * battery.dod * battery.efficiency;
  const autonomyHours = peakTotalW > 0 ? batteryUsableWh / peakTotalW : 0;
  const inverterLoadPct = inverter.acWatts > 0 ? (peakAcW / inverter.acWatts) * 100 : 0;
  const inverterSurgePct = inverter.surgeWatts > 0 ? (surgeAcW / inverter.surgeWatts) * 100 : 0;
  const mpptRequiredA = inputs.batteryVoltage > 0 ? (effectiveArrayW / inputs.batteryVoltage) * 1.25 : 0;
  const energyBalanceWh = dailyPvWh - dailyLoadWh * (1 + inputs.safetyMarginPct / 100);

  const targetPvWh = dailyLoadWh * (1 + inputs.safetyMarginPct / 100);
  const recommendedPanels = Math.max(1, Math.ceil(targetPvWh / Math.max(1, panel.watts * psh * 0.68)));
  const recommendedBatteries = Math.max(1, Math.ceil((dailyLoadWh * (inputs.backupHours / 24)) / Math.max(1, battery.voltage * battery.ah * battery.dod * battery.efficiency)));
  const recommendedInverterW = Math.ceil((peakAcW * 1.25) / 1000) * 1000;
  const recommendedMpptA = Math.ceil((((recommendedPanels * panel.watts) / Math.max(12, inputs.batteryVoltage)) * 1.25) / 10) * 10;

  const checks: Check[] = [];
  const push = (check: Check) => checks.push(check);

  if (dailyLoadWh <= 0) {
    push({ severity: 'fail', ku: 'هیچ بارەک نەهاتە زیادکرن.', en: 'No load was added.', fixKu: 'لانیکەم چرای، پەنگا یان appliance زێدە بکە.', fixEn: 'Add at least one appliance.', math: 'Daily load = 0 Wh' });
  }
  if (energyBalanceWh >= 0) {
    push({ severity: 'pass', ku: 'بەرهەما PV دایلی بۆ باران تەمامە.', en: 'Daily PV production covers the load.', fixKu: 'باشە؛ هێشتا دیتاشیت و سایت راستەقینە چێک بکە.', fixEn: 'Good; still verify real datasheets and site conditions.', math: `${kwh(dailyPvWh)} - ${kwh(targetPvWh)} = ${kwh(energyBalanceWh)}` });
  } else {
    push({ severity: 'fail', ku: 'بەرهەما PV کێمە بۆ بارێ رۆژانە.', en: 'PV daily production is lower than the daily load.', fixKu: 'ژمارا پانێلان زیاد بکە، باران کەم بکە یان PSH/derating راست بکە.', fixEn: 'Increase panels, reduce loads, or adjust PSH/derating.', math: `${kwh(dailyPvWh)} < ${kwh(targetPvWh)}` });
  }
  if (inverterLoadPct <= 80) {
    push({ severity: 'pass', ku: 'بارێ inverter ل ژێر 80% ـێیە.', en: 'Inverter continuous load is under 80%.', fixKu: 'باشە.', fixEn: 'Good.', math: `${w(peakAcW)} / ${w(inverter.acWatts)} = ${numberFmt.format(inverterLoadPct)}%` });
  } else if (inverterLoadPct <= 100) {
    push({ severity: 'warn', ku: 'inverter نزیکە ل سنوورێ کارێ خۆ.', en: 'Inverter is close to its continuous limit.', fixKu: 'inverter گەورەتر هەلبژێرە یان باران کەم بکە.', fixEn: 'Choose a larger inverter or reduce AC loads.', math: `${numberFmt.format(inverterLoadPct)}%` });
  } else {
    push({ severity: 'fail', ku: 'inverter overload ـە.', en: 'Inverter is overloaded.', fixKu: 'inverter گەورەتر هەلبژێرە.', fixEn: 'Select a larger inverter.', math: `${w(peakAcW)} > ${w(inverter.acWatts)}` });
  }
  if (inverterSurgePct > 100) {
    push({ severity: 'fail', ku: 'سەرج لۆدا AC زێدەیە.', en: 'AC surge exceeds inverter surge rating.', fixKu: 'بۆ motor/fridge/pump inverter ـا surge ـا بلندتر پێدڤیە.', fixEn: 'Motors/fridges/pumps need higher surge capability.', math: `${w(surgeAcW)} > ${w(inverter.surgeWatts)}` });
  }
  if (autonomyHours >= inputs.backupHours) {
    push({ severity: 'pass', ku: 'باتری دگەل backup ـا خوازراوی گونجاوە.', en: 'Battery storage meets requested backup.', fixKu: 'باشە.', fixEn: 'Good.', math: `${numberFmt.format(autonomyHours)} h ≥ ${inputs.backupHours} h` });
  } else {
    push({ severity: 'warn', ku: 'باتری بۆ backup ـا خوازراوی کێمە.', en: 'Battery storage is lower than requested backup.', fixKu: 'ژمارا باتری زیاد بکە یان باران کەم بکە.', fixEn: 'Increase battery count or reduce loads.', math: `${numberFmt.format(autonomyHours)} h < ${inputs.backupHours} h` });
  }
  if (mpptRequiredA <= mppt.amps) {
    push({ severity: 'pass', ku: 'MPPT current گونجاوە.', en: 'MPPT current rating is acceptable.', fixKu: 'باشە.', fixEn: 'Good.', math: `${a(mpptRequiredA)} ≤ ${a(mppt.amps)}` });
  } else {
    push({ severity: 'fail', ku: 'MPPT amps کێمن.', en: 'MPPT current rating is too low.', fixKu: 'MPPT گەورەتر یان ژمارا strings کەمتر بکە.', fixEn: 'Use a larger MPPT or reduce PV array current.', math: `${a(mpptRequiredA)} > ${a(mppt.amps)}` });
  }
  if (stringVoc <= mppt.maxPvVoc * 0.9) {
    push({ severity: 'pass', ku: 'Voc ـا string ل ناڤ سنوورێ MPPT ـێدایە.', en: 'String Voc is safely within MPPT limit.', fixKu: 'باشە.', fixEn: 'Good.', math: `${numberFmt.format(stringVoc)} V ≤ ${numberFmt.format(mppt.maxPvVoc * 0.9)} V training limit` });
  } else if (stringVoc <= mppt.maxPvVoc) {
    push({ severity: 'warn', ku: 'Voc نزیکە ل سنوورێ MPPT.', en: 'String Voc is close to MPPT limit.', fixKu: 'panelsPerString کەم بکە یان MPPT ـا Voc بلندتر بکاربینە.', fixEn: 'Reduce panels per string or use higher-Voc MPPT.', math: `${numberFmt.format(stringVoc)} V ≈ ${mppt.maxPvVoc} V` });
  } else {
    push({ severity: 'fail', ku: 'Voc ـا string زێدەترە ژ MPPT.', en: 'String Voc exceeds MPPT limit.', fixKu: 'ژمارا پانێل ل series کەم بکە.', fixEn: 'Reduce panels in series.', math: `${numberFmt.format(stringVoc)} V > ${mppt.maxPvVoc} V` });
  }
  if (inputs.hasDcBreaker && inputs.hasAcBreaker && inputs.hasSpd && inputs.hasEarthing) {
    push({ severity: 'pass', ku: 'چێکێ protection یێ تەمامە بۆ مودێلا مەشقێ.', en: 'Protection checklist is complete for training model.', fixKu: 'بۆ راستەقینە هەر دیتاشیت و code پێدڤیە.', fixEn: 'Real systems still need datasheets and code design.' });
  } else {
    push({ severity: 'warn', ku: 'Protection checklist ناقسە.', en: 'Protection checklist is incomplete.', fixKu: 'DC breaker، AC breaker، SPD و earthing ل model ـێ چالاک بکە.', fixEn: 'Enable DC breaker, AC breaker, SPD, and earthing in the model.' });
  }

  const penalty = checks.reduce((s, c) => s + (c.severity === 'fail' ? 22 : c.severity === 'warn' ? 9 : 0), 0);
  const score = clamp(100 - penalty, 0, 100);
  const status: Simulation['status'] = checks.some((c) => c.severity === 'fail') ? 'FAIL' : checks.some((c) => c.severity === 'warn') ? 'WARNING' : 'PASS';

  const loadShape = [0.35, 0.28, 0.2, 0.2, 0.25, 0.4, 0.65, 0.8, 0.75, 0.65, 0.6, 0.65, 0.7, 0.65, 0.6, 0.65, 0.85, 1, 1, 0.95, 0.85, 0.7, 0.55, 0.45];
  const solarShape = [0, 0, 0, 0, 0, 0.08, 0.25, 0.45, 0.65, 0.82, 0.95, 1, 0.98, 0.88, 0.72, 0.5, 0.25, 0.08, 0, 0, 0, 0, 0, 0];
  let batteryPct = 60;
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const load = peakTotalW * loadShape[i];
    const pv = effectiveArrayW * solarShape[i];
    batteryPct = clamp(batteryPct + ((pv - load) / Math.max(1, batteryUsableWh)) * 100, 5, 100);
    return { hour: `${i}:00`, pv: Math.round(pv), load: Math.round(load), battery: Math.round(batteryPct) };
  });

  const ivCurve = Array.from({ length: 11 }, (_, idx) => {
    const ratio = idx / 10;
    const voltage = stringVoc * ratio;
    const current = Math.max(0, arrayImp * (1 - Math.pow(Math.max(0, ratio - 0.78) / 0.22, 2)));
    return { voltage: Math.round(voltage), current: Number(current.toFixed(1)), power: Math.round(voltage * current) };
  });

  const lossData = [
    { name: 'Irradiance', value: Math.round((inputs.irradiance / 1000) * 100) },
    { name: 'Temp', value: Math.round(tempFactor * 100) },
    { name: 'Soiling', value: Math.round((1 - inputs.soilingLossPct / 100) * 100) },
    { name: 'Shadow', value: Math.round((1 - inputs.shadowLossPct / 100) * 100) },
    { name: 'Wiring', value: Math.round((1 - inputs.wiringLossPct / 100) * 100) },
  ];

  return {
    city,
    panel,
    battery,
    inverter,
    mppt,
    dailyLoadWh,
    peakAcW,
    peakDcW,
    peakTotalW,
    surgeAcW,
    psh,
    cellTempC,
    strings,
    stcArrayW,
    tempFactor,
    environmentFactor,
    effectiveArrayW,
    stringVmp,
    stringVoc,
    arrayImp,
    dailyPvWh,
    batteryNominalWh,
    batteryUsableWh,
    autonomyHours,
    inverterLoadPct,
    inverterSurgePct,
    mpptRequiredA,
    energyBalanceWh,
    recommendedPanels,
    recommendedBatteries,
    recommendedInverterW,
    recommendedMpptA,
    score,
    status,
    checks,
    hourly,
    ivCurve,
    lossData,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, tone = 'blue' }: { label: string; value: string; tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate' }) {
  return (
    <div className={`metric metric-${tone}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function Section({ title, icon, children, className = '' }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function LabSchematic({ sim, lang }: { sim: Simulation; lang: Lang }) {
  const good = sim.status === 'PASS';
  return (
    <div className="lab-schematic" dir="ltr">
      <div className="sun-block">
        <div className="sun-core"><Sun size={44} /></div>
        <span>{lang === 'ku' ? 'خۆر / Irradiance' : 'Sun / Irradiance'}</span>
        <b>{sim.effectiveArrayW.toFixed(0)} W</b>
      </div>

      <div className="pv-array device">
        <div className="panel-grid" />
        <span>{sim.panel.brand}</span>
        <strong>{sim.stcArrayW.toFixed(0)}W STC</strong>
      </div>

      <svg className="schematic-lines" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0ea5e9" />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
          </marker>
          <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>
        <path className="flow flow-yellow" d="M95,72 C145,95 160,130 155,178" />
        <path className="flow dc-flow" d="M170,215 C250,210 300,160 370,170" markerEnd="url(#arrowBlue)" />
        <path className="flow signal-flow" d="M318,250 C380,295 460,285 520,240" markerEnd="url(#arrowGreen)" />
        <path className="flow dc-flow" d="M620,175 C700,175 710,130 772,115" markerEnd="url(#arrowBlue)" />
        <path className="flow ac-flow" d="M822,116 C900,95 932,125 945,178" markerEnd="url(#arrowGreen)" />
        <path className="flow battery-flow" d="M620,220 C700,270 790,280 810,220" markerEnd="url(#arrowRed)" />
      </svg>

      <div className="laptop device">
        <Laptop size={70} />
        <span>SolarLab PC</span>
        <strong>PV curve + load profile</strong>
      </div>

      <div className="emulator device rack">
        <div className="rack-screen">{sim.stringVmp.toFixed(0)}V · {sim.arrayImp.toFixed(1)}A</div>
        <div className="rack-knobs"><i /><i /><i /><i /></div>
        <span>{lang === 'ku' ? 'PV Array Emulator' : 'PV Array Emulator'}</span>
        <strong>{sim.strings} strings · PV emulator</strong>
      </div>

      <div className="battery-bank device">
        <BatteryCharging size={48} />
        <span>{sim.battery.brand}</span>
        <strong>{kwh(sim.batteryUsableWh)} usable</strong>
      </div>

      <div className="inverter3d device">
        <Zap size={46} />
        <span>{sim.inverter.brand}</span>
        <strong>{sim.inverter.acWatts / 1000}kW inverter</strong>
      </div>

      <div className={`grid-tower ${good ? 'ok' : 'warn'}`}>
        <Grid2X2 size={46} />
        <span>{lang === 'ku' ? 'AC Load / Grid' : 'AC Load / Grid'}</span>
        <strong>{w(sim.peakAcW)}</strong>
      </div>

      <div className="schematic-label dc">DC</div>
      <div className="schematic-label ac">AC</div>
      <div className="schematic-label signal">Simulation Data</div>
    </div>
  );
}

function App() {
  const [inputs, setInputs] = useState<Inputs>({
    lang: 'ku',
    projectName: 'مالا دهۆکێ — تمرینا پیشەیی',
    cityId: 'duhok',
    pshOverride: 5.2,
    usePshOverride: false,
    ambientTemp: 42,
    irradiance: 900,
    soilingLossPct: 8,
    shadowLossPct: 0,
    wiringLossPct: 3,
    safetyMarginPct: 25,
    backupHours: 6,
    batteryVoltage: 48,
    panelId: panels[0].id,
    panelCount: 10,
    panelsPerString: 5,
    batteryId: batteries[0].id,
    batteryCount: 2,
    inverterId: inverters[0].id,
    mpptId: mppts[2].id,
    hasDcBreaker: true,
    hasAcBreaker: true,
    hasSpd: true,
    hasEarthing: true,
  });
  const [loads, setLoads] = useState<LoadItem[]>(defaultLoads);
  const lang = inputs.lang;
  const copy = t[lang];
  const sim = useMemo(() => calculate(loads, inputs), [loads, inputs]);

  const updateInput = <K extends keyof Inputs>(key: K, value: Inputs[K]) => setInputs((prev) => ({ ...prev, [key]: value }));
  const updateLoad = (id: string, patch: Partial<LoadItem>) => setLoads((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  function autoDesign() {
    const next = calculate(loads, inputs);
    const bestInverter = inverters.find((inv) => inv.acWatts >= next.recommendedInverterW && inv.dcVoltage === inputs.batteryVoltage) ?? inverters[inverters.length - 1];
    const bestMppt = mppts.find((m) => m.amps >= next.recommendedMpptA && m.batteryVoltage === inputs.batteryVoltage) ?? mppts[2];
    setInputs((prev) => ({
      ...prev,
      panelCount: next.recommendedPanels,
      batteryCount: next.recommendedBatteries,
      panelsPerString: clamp(prev.panelsPerString, 1, Math.max(1, next.recommendedPanels)),
      inverterId: bestInverter.id,
      mpptId: bestMppt.id,
      hasDcBreaker: true,
      hasAcBreaker: true,
      hasSpd: true,
      hasEarthing: true,
    }));
  }

  function addLoad() {
    const id = crypto.randomUUID();
    setLoads((prev) => [...prev, { id, nameKu: 'بارا نوی', nameEn: 'New load', type: 'AC', watts: 100, qty: 1, hours: 4, surge: 1.2 }]);
  }

  function reset() {
    setLoads(defaultLoads);
    setInputs((prev) => ({ ...prev, panelCount: 10, batteryCount: 2, panelsPerString: 5, shadowLossPct: 0, soilingLossPct: 8, wiringLossPct: 3, hasDcBreaker: true, hasAcBreaker: true, hasSpd: true, hasEarthing: true }));
  }

  function exportReport() {
    const lines = [
      'SolarLab PV Emulator Pro Report',
      `Project: ${inputs.projectName}`,
      `City: ${lang === 'ku' ? sim.city.ku : sim.city.en}`,
      `PV array: ${sim.panel.brand} ${sim.panel.model} x ${inputs.panelCount}`,
      `Battery: ${sim.battery.brand} ${sim.battery.model} x ${inputs.batteryCount}`,
      `Inverter: ${sim.inverter.brand} ${sim.inverter.model}`,
      `Daily load: ${kwh(sim.dailyLoadWh)}`,
      `Daily PV estimate: ${kwh(sim.dailyPvWh)}`,
      `Battery usable: ${kwh(sim.batteryUsableWh)}`,
      `Autonomy: ${numberFmt.format(sim.autonomyHours)} hours`,
      `Status: ${sim.status}`,
      `Score: ${sim.score}/100`,
      '',
      'Checks:',
      ...sim.checks.map((c) => `- [${c.severity.toUpperCase()}] ${lang === 'ku' ? c.ku : c.en} ${c.math ? `(${c.math})` : ''}`),
      '',
      'Safety: educational simulation only; not certified engineering design.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const aTag = document.createElement('a');
    aTag.href = url;
    aTag.download = 'solarlab-pv-emulator-report.txt';
    aTag.click();
    URL.revokeObjectURL(url);
  }

  const dir = lang === 'ku' ? 'rtl' : 'ltr';
  const city = cities.find((c) => c.id === inputs.cityId) ?? cities[0];

  return (
    <main className="app" dir={dir}>
      <header className="hero">
        <div>
          <div className="eyebrow"><Factory size={18} /> PV Array Emulator · Iraq/Kurdistan Training Lab</div>
          <h1>{copy.app}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <div className="hero-actions">
          <button className="btn ghost" onClick={() => updateInput('lang', lang === 'ku' ? 'en' : 'ku')}><Globe2 size={18} /> {copy.switch}</button>
          <button className="btn" onClick={autoDesign}><Calculator size={18} /> {copy.auto}</button>
          <button className="btn dark" onClick={exportReport}><Download size={18} /> {copy.export}</button>
        </div>
      </header>

      <div className="safety-banner"><ShieldCheck size={22} /><span>{copy.safety}</span></div>

      <div className="top-metrics">
        <Metric label={lang === 'ku' ? 'دۆخ' : 'Status'} value={sim.status} tone={sim.status === 'PASS' ? 'green' : sim.status === 'WARNING' ? 'amber' : 'red'} />
        <Metric label={lang === 'ku' ? 'Score' : 'Score'} value={`${sim.score}/100`} tone="blue" />
        <Metric label={lang === 'ku' ? 'بارا رۆژانە' : 'Daily load'} value={kwh(sim.dailyLoadWh)} tone="slate" />
        <Metric label={lang === 'ku' ? 'PV رۆژانە' : 'Daily PV'} value={kwh(sim.dailyPvWh)} tone="green" />
        <Metric label={lang === 'ku' ? 'باتری usable' : 'Usable battery'} value={kwh(sim.batteryUsableWh)} tone="amber" />
      </div>

      <div className="main-grid">
        <div className="left-column">
          <Section title={copy.workflow} icon={<ToggleLeft size={20} />}>
            <div className="form-grid">
              <Field label={lang === 'ku' ? 'ناڤێ پڕۆژەیێ' : 'Project name'}>
                <input value={inputs.projectName} onChange={(e) => updateInput('projectName', e.target.value)} />
              </Field>
              <Field label={lang === 'ku' ? 'باژێر' : 'City'}>
                <select value={inputs.cityId} onChange={(e) => updateInput('cityId', e.target.value)}>
                  {cities.map((c) => <option value={c.id} key={c.id}>{lang === 'ku' ? c.ku : c.en}</option>)}
                </select>
              </Field>
              <Field label={lang === 'ku' ? 'System DC voltage' : 'System DC voltage'}>
                <select value={inputs.batteryVoltage} onChange={(e) => updateInput('batteryVoltage', Number(e.target.value))}>
                  {[12, 24, 48].map((v) => <option key={v} value={v}>{v}V</option>)}
                </select>
              </Field>
              <Field label={lang === 'ku' ? 'Backup hours' : 'Backup hours'}>
                <input type="number" min="1" max="48" value={inputs.backupHours} onChange={(e) => updateInput('backupHours', Number(e.target.value))} />
              </Field>
              <Field label={lang === 'ku' ? 'Irradiance W/m²' : 'Irradiance W/m²'}>
                <input type="range" min="100" max="1100" step="10" value={inputs.irradiance} onChange={(e) => updateInput('irradiance', Number(e.target.value))} />
                <b>{inputs.irradiance} W/m²</b>
              </Field>
              <Field label={lang === 'ku' ? 'Temp °C' : 'Ambient temp °C'}>
                <input type="number" min="0" max="60" value={inputs.ambientTemp} onChange={(e) => updateInput('ambientTemp', Number(e.target.value))} />
              </Field>
              <Field label={lang === 'ku' ? 'تۆز/سوێلینگ %' : 'Soiling loss %'}>
                <input type="number" min="0" max="40" value={inputs.soilingLossPct} onChange={(e) => updateInput('soilingLossPct', Number(e.target.value))} />
              </Field>
              <Field label={lang === 'ku' ? 'سایە %' : 'Shadow loss %'}>
                <input type="number" min="0" max="90" value={inputs.shadowLossPct} onChange={(e) => updateInput('shadowLossPct', Number(e.target.value))} />
              </Field>
              <Field label={lang === 'ku' ? 'Loss ـا سیمان %' : 'Wiring loss %'}>
                <input type="number" min="0" max="20" value={inputs.wiringLossPct} onChange={(e) => updateInput('wiringLossPct', Number(e.target.value))} />
              </Field>
              <Field label={lang === 'ku' ? 'Margin %' : 'Design margin %'}>
                <input type="number" min="0" max="50" value={inputs.safetyMarginPct} onChange={(e) => updateInput('safetyMarginPct', Number(e.target.value))} />
              </Field>
            </div>
            <p className="mini-note">{lang === 'ku' ? city.noteKu : city.noteEn}</p>
          </Section>

          <Section title={copy.loads} icon={<ClipboardList size={20} />}>
            <div className="load-table-wrap">
              <table className="load-table">
                <thead>
                  <tr>
                    <th>{lang === 'ku' ? 'ناڤ' : 'Name'}</th>
                    <th>AC/DC</th>
                    <th>W</th>
                    <th>{lang === 'ku' ? 'ژمارە' : 'Qty'}</th>
                    <th>h/day</th>
                    <th>Surge</th>
                  </tr>
                </thead>
                <tbody>
                  {loads.map((item) => (
                    <tr key={item.id}>
                      <td><input value={lang === 'ku' ? item.nameKu : item.nameEn} onChange={(e) => updateLoad(item.id, lang === 'ku' ? { nameKu: e.target.value } : { nameEn: e.target.value })} /></td>
                      <td><select value={item.type} onChange={(e) => updateLoad(item.id, { type: e.target.value as LoadType })}><option>AC</option><option>DC</option></select></td>
                      <td><input type="number" value={item.watts} onChange={(e) => updateLoad(item.id, { watts: Number(e.target.value) })} /></td>
                      <td><input type="number" value={item.qty} onChange={(e) => updateLoad(item.id, { qty: Number(e.target.value) })} /></td>
                      <td><input type="number" value={item.hours} onChange={(e) => updateLoad(item.id, { hours: Number(e.target.value) })} /></td>
                      <td><input type="number" step="0.1" value={item.surge} onChange={(e) => updateLoad(item.id, { surge: Number(e.target.value) })} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="button-row">
              <button className="btn small" onClick={addLoad}>+ {lang === 'ku' ? 'بار زێدە بکە' : 'Add load'}</button>
              <button className="btn small ghost" onClick={reset}><RotateCcw size={16} /> {copy.reset}</button>
            </div>
          </Section>
        </div>

        <div className="center-column">
          <Section title={copy.lab} icon={<Zap size={20} />} className="diagram-panel">
            <LabSchematic sim={sim} lang={lang} />
          </Section>

          <Section title={copy.market} icon={<Factory size={20} />}>
            <div className="market-grid">
              <Field label="PV Module">
                <select value={inputs.panelId} onChange={(e) => updateInput('panelId', e.target.value)}>
                  {panels.map((p) => <option key={p.id} value={p.id}>{p.brand} · {p.model}</option>)}
                </select>
              </Field>
              <Field label={lang === 'ku' ? 'ژمارا پانێلان' : 'Panel count'}>
                <input type="number" min="1" value={inputs.panelCount} onChange={(e) => updateInput('panelCount', Number(e.target.value))} />
              </Field>
              <Field label={lang === 'ku' ? 'Panels / string' : 'Panels per string'}>
                <input type="number" min="1" value={inputs.panelsPerString} onChange={(e) => updateInput('panelsPerString', Number(e.target.value))} />
              </Field>
              <Field label="Battery">
                <select value={inputs.batteryId} onChange={(e) => updateInput('batteryId', e.target.value)}>
                  {batteries.map((b) => <option key={b.id} value={b.id}>{b.brand} · {b.model}</option>)}
                </select>
              </Field>
              <Field label={lang === 'ku' ? 'ژمارا باتری' : 'Battery count'}>
                <input type="number" min="1" value={inputs.batteryCount} onChange={(e) => updateInput('batteryCount', Number(e.target.value))} />
              </Field>
              <Field label="Inverter">
                <select value={inputs.inverterId} onChange={(e) => updateInput('inverterId', e.target.value)}>
                  {inverters.map((i) => <option key={i.id} value={i.id}>{i.brand} · {i.model}</option>)}
                </select>
              </Field>
              <Field label="MPPT / Controller">
                <select value={inputs.mpptId} onChange={(e) => updateInput('mpptId', e.target.value)}>
                  {mppts.map((m) => <option key={m.id} value={m.id}>{m.brand} · {m.model}</option>)}
                </select>
              </Field>
            </div>
            <div className="protection-row">
              {[
                ['hasDcBreaker', 'DC breaker'],
                ['hasAcBreaker', 'AC breaker'],
                ['hasSpd', 'SPD'],
                ['hasEarthing', 'Earthing'],
              ].map(([key, label]) => (
                <label className="check-pill" key={key}>
                  <input type="checkbox" checked={Boolean(inputs[key as keyof Inputs])} onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>
            <p className="mini-note">{lang === 'ku' ? sim.panel.marketKu : sim.panel.marketEn}</p>
          </Section>

          <Section title={copy.charts} icon={<LineChartIcon size={20} />}>
            <div className="chart-grid">
              <div className="chart-card">
                <h3>{lang === 'ku' ? 'PV و Load بۆ 24 کاتژمێران' : 'PV vs load over 24h'}</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={sim.hourly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" minTickGap={18} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pv" name="PV W" stroke="#22c55e" fill="#bbf7d0" />
                    <Area type="monotone" dataKey="load" name="Load W" stroke="#0ea5e9" fill="#bae6fd" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>{lang === 'ku' ? 'PV I-V / P-V curve' : 'PV I-V / P-V curve'}</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={sim.ivCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="voltage" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="current" name="A" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="power" name="W" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Section>
        </div>

        <div className="right-column">
          <Section title={copy.result} icon={<Gauge size={20} />}>
            <div className="result-status">
              <div className={`status-badge ${sim.status.toLowerCase()}`}>{sim.status}</div>
              <div className="score-ring"><strong>{sim.score}</strong><span>/100</span></div>
            </div>
            <div className="metric-list">
              <Metric label="PV STC" value={w(sim.stcArrayW)} tone="slate" />
              <Metric label="PV Effective" value={w(sim.effectiveArrayW)} tone="green" />
              <Metric label="String Vmp / Voc" value={`${numberFmt.format(sim.stringVmp)}V / ${numberFmt.format(sim.stringVoc)}V`} tone="blue" />
              <Metric label="MPPT required" value={a(sim.mpptRequiredA)} tone="amber" />
              <Metric label="Inverter load" value={`${numberFmt.format(sim.inverterLoadPct)}%`} tone={sim.inverterLoadPct > 100 ? 'red' : 'blue'} />
              <Metric label="Autonomy" value={`${numberFmt.format(sim.autonomyHours)} h`} tone="green" />
            </div>
            <div className="checks">
              {sim.checks.map((check, i) => (
                <article className={`check ${check.severity}`} key={`${check.en}-${i}`}>
                  <div>{check.severity === 'pass' ? <CheckCircle2 size={18} /> : check.severity === 'fail' ? <AlertTriangle size={18} /> : <Info size={18} />}</div>
                  <div>
                    <strong>{lang === 'ku' ? check.ku : check.en}</strong>
                    <p>{lang === 'ku' ? check.fixKu : check.fixEn}</p>
                    {check.math ? <code>{check.math}</code> : null}
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section title={copy.formulas} icon={<Calculator size={20} />}>
            <div className="formula-box">
              <code>Ppv = Pstc × G/1000 × TempFactor × LossFactor</code>
              <code>TempFactor = 1 + γ × (Tcell - 25)</code>
              <code>Tcell ≈ Tamb + (G/800) × 20</code>
              <code>DailyPV = Ppv × PSH × ηMPPT × ηINV</code>
              <code>BatteryWh = V × Ah × count</code>
              <code>UsableWh = BatteryWh × DoD × ηbattery</code>
              <code>Runtime = UsableWh / PeakLoadW</code>
            </div>
            <div className="recommend-card">
              <h3>{lang === 'ku' ? 'پێشنیارا خۆکار' : 'Auto recommendation'}</h3>
              <p>{lang === 'ku' ? 'پانێل' : 'Panels'}: <b>{sim.recommendedPanels}</b></p>
              <p>{lang === 'ku' ? 'باتری' : 'Batteries'}: <b>{sim.recommendedBatteries}</b></p>
              <p>{lang === 'ku' ? 'Inverter' : 'Inverter'}: <b>{w(sim.recommendedInverterW)}</b></p>
              <p>MPPT: <b>{a(sim.recommendedMpptA)}</b></p>
              <button className="btn full" onClick={autoDesign}><Play size={16} /> {copy.auto}</button>
            </div>
            <div className="button-row stacked">
              <button className="btn dark full" onClick={() => window.print()}>{copy.print}</button>
              <button className="btn ghost full" onClick={exportReport}>{copy.export}</button>
            </div>
            <p className="truth"><AlertTriangle size={16} /> {copy.notCertified}</p>
          </Section>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
