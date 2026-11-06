/**
 * Digital Farm Lab — Simulation Engine
 *
 * All calculations are deterministic educational estimates based on
 * documented agronomic principles. They are NOT real-world agronomic
 * predictions and should be used only for learning purposes.
 *
 * Key references used for assumptions:
 * - FAO Crop Water Requirements (Doorenbos & Pruitt, 1977)
 * - GRDC Crop Nutrition guidelines
 * - South African Department of Agriculture irrigation scheduling norms
 */

export type SimulationResult = {
  score: number;           // 0-100 educational score
  recommendation: string;
  chartData: ChartPoint[];
  metrics: Record<string, string | number>;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  insights: string[];
  yieldEstimate: string;
  waterUse: number;        // percentage of optimal
  nutrientEfficiency: number; // percentage
};

export type ChartPoint = {
  label: string;
  value: number;
  color?: string;
};

// ─── Irrigation Simulation ───────────────────────────────────────────────────
// Assumption: Optimal maize needs ~600 mm water over 120 days.
// Under-irrigation reduces yield by ~1.2% per mm deficit.
// Over-irrigation leaches nutrients and reduces yield by ~0.6% per 10mm excess.

export type IrrigationInput = {
  irrigationLevel: number;      // 0–100 % of optimal rate
  frequencyDays: number;        // irrigation interval in days (1–14)
  cropType: 'maize' | 'tomatoes' | 'wheat' | 'soybeans';
  soilType: 'sandy' | 'loam' | 'clay';
};

const CROP_BASE_YIELD: Record<string, number> = {
  maize: 8.5, tomatoes: 55, wheat: 5.0, soybeans: 3.2,
};
const CROP_WATER_UNIT: Record<string, string> = {
  maize: 't/ha', tomatoes: 't/ha', wheat: 't/ha', soybeans: 't/ha',
};
const SOIL_DRAINAGE: Record<string, number> = { sandy: 1.3, loam: 1.0, clay: 0.75 };

export function runIrrigationSimulation(input: IrrigationInput): SimulationResult {
  const { irrigationLevel, frequencyDays, cropType, soilType } = input;
  const baseYield = CROP_BASE_YIELD[cropType] ?? 8.5;
  const drainageFactor = SOIL_DRAINAGE[soilType] ?? 1.0;

  // Yield response curve (assumption: optimum at 85–95% of full irrigation)
  const optimalLevel = 90;
  const deficit = Math.max(0, optimalLevel - irrigationLevel);
  const excess = Math.max(0, irrigationLevel - optimalLevel);
  const deficitPenalty = deficit * 0.012;    // 1.2% yield loss per % below optimal
  const excessPenalty = excess * 0.006;      // 0.6% yield loss per % above optimal
  const frequencyPenalty = Math.max(0, frequencyDays - 4) * 0.015; // stress from infrequency
  const soilBonus = soilType === 'loam' ? 0.05 : 0;

  const yieldFactor = Math.max(0.1, 1 - deficitPenalty - excessPenalty - frequencyPenalty + soilBonus);
  const estimatedYield = (baseYield * yieldFactor * drainageFactor).toFixed(1);
  const waterUse = Math.min(100, irrigationLevel);

  // Score: best when irrigation ~85-95%, frequency ≤4 days, loam soil
  const score = Math.round(Math.max(0, Math.min(100,
    100 - deficit * 0.8 - excess * 0.4 - Math.max(0, frequencyDays - 3) * 5
  )));

  const riskLevel = score >= 75 ? 'Low' : score >= 50 ? 'Moderate' : score >= 30 ? 'High' : 'Critical';

  const chartData: ChartPoint[] = [
    { label: 'Your yield', value: parseFloat(estimatedYield), color: '#236B45' },
    { label: 'Optimal yield', value: baseYield, color: '#E8F4E9' },
    { label: 'Water use %', value: waterUse, color: '#2B7FDE' },
  ];

  const soilMoisture = Math.min(100, irrigationLevel * 0.85 + (soilType === 'clay' ? 10 : 0));
  const insights = [
    irrigationLevel < 70
      ? 'Severe water deficit detected — crop stress is likely during vegetative growth.'
      : irrigationLevel > 110
        ? 'Over-irrigation is leaching nutrients and reducing oxygen in the root zone.'
        : 'Irrigation level is within an acceptable range for this crop type.',
    frequencyDays > 7
      ? 'Long intervals between irrigation events increase mid-day water stress.'
      : 'Irrigation frequency supports consistent soil moisture.',
    soilType === 'sandy'
      ? 'Sandy soils require more frequent, smaller applications to retain moisture.'
      : soilType === 'clay'
        ? 'Clay soils retain moisture well but can become waterlogged with excess irrigation.'
        : 'Loam soil provides ideal water-holding capacity for this crop.',
  ];

  return {
    score,
    recommendation:
      irrigationLevel < 70
        ? `Increase irrigation to at least 85% of crop water requirement. Current deficit risks yield loss of ~${(deficitPenalty * 100).toFixed(0)}%.`
        : irrigationLevel > 100
          ? `Reduce irrigation to 85–95% of optimal rate to avoid waterlogging and nutrient leaching.`
          : `Maintain current irrigation level. Adjust frequency to every 3–4 days for optimal moisture.`,
    chartData,
    metrics: {
      'Estimated yield': `${estimatedYield} ${CROP_WATER_UNIT[cropType]}`,
      'Soil moisture': `${soilMoisture.toFixed(0)}%`,
      'Water use': `${waterUse}% of optimal`,
      'Frequency': `Every ${frequencyDays} day(s)`,
      'Yield factor': `${(yieldFactor * 100).toFixed(0)}%`,
    },
    riskLevel,
    insights,
    yieldEstimate: `${estimatedYield} ${CROP_WATER_UNIT[cropType]}`,
    waterUse,
    nutrientEfficiency: Math.round(Math.max(20, 100 - excessPenalty * 50)),
  };
}

// ─── Drought Simulation ───────────────────────────────────────────────────────
// Assumption: Maize at anthesis (flowering) loses ~8% yield per day without rain.
// Drought-tolerant varieties recover better with <15% extra yield loss per 7-day spell.

export type DroughtInput = {
  rainfallMm: number;           // mm per week (0–60)
  consecutiveDryDays: number;   // 0–60 days
  cropStage: 'seedling' | 'vegetative' | 'flowering' | 'grain_fill' | 'maturity';
  managementStrategy: 'none' | 'mulching' | 'droughtVariety' | 'deficit_irrigation';
};

const STAGE_SENSITIVITY: Record<string, number> = {
  seedling: 0.5, vegetative: 0.7, flowering: 1.0, grain_fill: 0.9, maturity: 0.3,
};

export function runDroughtSimulation(input: DroughtInput): SimulationResult {
  const { rainfallMm, consecutiveDryDays, cropStage, managementStrategy } = input;
  const stageSensitivity = STAGE_SENSITIVITY[cropStage] ?? 0.7;

  // Soil moisture model (FAO bucket model simplified)
  // Optimal maize weekly demand ~40mm; each mm below = 1.5% soil moisture drop
  const optimalRainfall = 40;
  const rainfallDeficit = Math.max(0, optimalRainfall - rainfallMm);
  const dryDayPenalty = consecutiveDryDays * 0.018 * stageSensitivity;
  const rainfallPenalty = rainfallDeficit * 0.015 * stageSensitivity;

  const strategyBonus: Record<string, number> = {
    none: 0, mulching: 0.12, droughtVariety: 0.20, deficit_irrigation: 0.30,
  };
  const bonus = strategyBonus[managementStrategy] ?? 0;

  const yieldLoss = Math.min(0.95, Math.max(0, dryDayPenalty + rainfallPenalty - bonus));
  const estimatedYield = (8.5 * (1 - yieldLoss)).toFixed(1);
  const soilMoisture = Math.max(5, 75 - rainfallDeficit * 1.2 - consecutiveDryDays * 0.8);
  const stressIndex = Math.min(100, (yieldLoss * 100));

  const score = Math.round(Math.max(0, 100 - stressIndex * 0.8 + bonus * 50));
  const riskLevel = yieldLoss > 0.6 ? 'Critical' : yieldLoss > 0.4 ? 'High' : yieldLoss > 0.2 ? 'Moderate' : 'Low';

  const chartData: ChartPoint[] = [
    { label: 'Soil moisture', value: Math.round(soilMoisture), color: '#2B7FDE' },
    { label: 'Stress index', value: Math.round(stressIndex), color: '#E8503A' },
    { label: 'Yield retained', value: Math.round((1 - yieldLoss) * 100), color: '#236B45' },
  ];

  return {
    score,
    recommendation:
      managementStrategy === 'none' && yieldLoss > 0.3
        ? 'Apply mulching immediately to conserve soil moisture. Consider drought-tolerant varieties for replanting.'
        : managementStrategy === 'deficit_irrigation'
          ? 'Deficit irrigation is your best tool. Apply 50–60% of full crop water requirement during critical stages.'
          : 'Your current strategy provides some protection. Monitor soil moisture daily during dry spells.',
    chartData,
    metrics: {
      'Rainfall': `${rainfallMm} mm/week`,
      'Dry days': `${consecutiveDryDays} days`,
      'Soil moisture': `${soilMoisture.toFixed(0)}%`,
      'Yield loss': `${(yieldLoss * 100).toFixed(0)}%`,
      'Estimated yield': `${estimatedYield} t/ha`,
      'Crop stage': cropStage.replace('_', ' '),
    },
    riskLevel,
    insights: [
      `Crop is in ${cropStage.replace('_', ' ')} stage — ${stageSensitivity >= 0.9 ? 'CRITICAL period for water stress' : 'moderate water sensitivity'}.`,
      consecutiveDryDays > 21
        ? 'Extended dry spell exceeds the typical drought threshold. Intervention is essential.'
        : consecutiveDryDays > 10
          ? 'Moderate dry spell — monitor crop canopy temperature for heat stress signs.'
          : 'Dry period is within manageable range for most crops.',
      `Management strategy (${managementStrategy.replace('_', ' ')}) reduces yield loss by ~${(bonus * 100).toFixed(0)}%.`,
    ],
    yieldEstimate: `${estimatedYield} t/ha`,
    waterUse: Math.round(rainfallMm / optimalRainfall * 100),
    nutrientEfficiency: Math.round(Math.max(30, 90 - stressIndex * 0.4)),
  };
}

// ─── Fertilizer Simulation ────────────────────────────────────────────────────
// Assumption: Maize optimum N = 150 kg/ha; P = 60 kg/ha; K = 90 kg/ha
// Liebig's Law of the Minimum applies — yield limited by most deficient nutrient.
// Excess N (>200 kg/ha) reduces yield through salt stress and lodging.

export type FertilizerInput = {
  nitrogenKg: number;    // kg N per ha (0–300)
  phosphorusKg: number;  // kg P per ha (0–150)
  potassiumKg: number;   // kg K per ha (0–200)
  fertilizerType: 'urea' | 'limestone_ammonium_nitrate' | 'organic_compost' | 'npk_balanced';
  applicationTiming: 'basal' | 'split_2' | 'split_3' | 'fertigation';
};

const OPTIMAL_N = 150, OPTIMAL_P = 60, OPTIMAL_K = 90;

export function runFertilizerSimulation(input: FertilizerInput): SimulationResult {
  const { nitrogenKg, phosphorusKg, potassiumKg, fertilizerType, applicationTiming } = input;

  // Nutrient sufficiency indices (0–1)
  const nSufficiency = nitrogenKg >= OPTIMAL_N
    ? Math.max(0, 1 - (nitrogenKg - OPTIMAL_N) * 0.004) // excess penalty
    : nitrogenKg / OPTIMAL_N;
  const pSufficiency = Math.min(1, phosphorusKg / OPTIMAL_P);
  const kSufficiency = Math.min(1, potassiumKg / OPTIMAL_K);

  // Liebig minimum
  const liebigMin = Math.min(nSufficiency, pSufficiency, kSufficiency);

  // Application timing bonus
  const timingBonus: Record<string, number> = {
    basal: 0, split_2: 0.08, split_3: 0.14, fertigation: 0.18,
  };
  const timBonus = timingBonus[applicationTiming] ?? 0;

  // Fertilizer type efficiency
  const typeEfficiency: Record<string, number> = {
    urea: 0.65, limestone_ammonium_nitrate: 0.78, organic_compost: 0.55, npk_balanced: 0.82,
  };
  const efficiency = typeEfficiency[fertilizerType] ?? 0.70;

  const yieldFactor = Math.min(1.05, liebigMin * efficiency + timBonus);
  const estimatedYield = (8.5 * yieldFactor).toFixed(1);
  const totalNutrientScore = (nSufficiency + pSufficiency + kSufficiency) / 3;
  const overapplication = nitrogenKg > 200 || phosphorusKg > 100 || potassiumKg > 150;

  const score = Math.round(Math.max(0, Math.min(100,
    totalNutrientScore * 60 + timBonus * 100 + (efficiency - 0.5) * 40
  )));
  const riskLevel = overapplication ? 'High' : liebigMin < 0.4 ? 'Moderate' : 'Low';

  const chartData: ChartPoint[] = [
    { label: 'N sufficiency', value: Math.round(nSufficiency * 100), color: '#236B45' },
    { label: 'P sufficiency', value: Math.round(pSufficiency * 100), color: '#E8B94F' },
    { label: 'K sufficiency', value: Math.round(kSufficiency * 100), color: '#98734B' },
    { label: 'Yield estimate', value: Math.round(yieldFactor * 100), color: '#2B7FDE' },
  ];

  return {
    score,
    recommendation:
      liebigMin < 0.5
        ? `Increase the most limiting nutrient. Your Liebig minimum is ${(liebigMin * 100).toFixed(0)}% — this is capping yield potential.`
        : overapplication
          ? 'You are applying excess fertilizer. This increases cost, environmental risk and can reduce yields through salt stress.'
          : `Good nutrient balance. Use ${applicationTiming.replace('_', '-')} application to maximise uptake efficiency.`,
    chartData,
    metrics: {
      'N applied': `${nitrogenKg} kg/ha (opt: ${OPTIMAL_N})`,
      'P applied': `${phosphorusKg} kg/ha (opt: ${OPTIMAL_P})`,
      'K applied': `${potassiumKg} kg/ha (opt: ${OPTIMAL_K})`,
      'Yield estimate': `${estimatedYield} t/ha`,
      'Nutrient efficiency': `${(efficiency * 100).toFixed(0)}%`,
      'Overapplication risk': overapplication ? 'Yes' : 'No',
    },
    riskLevel,
    insights: [
      `Liebig minimum nutrient: ${nSufficiency <= pSufficiency && nSufficiency <= kSufficiency ? 'Nitrogen' : pSufficiency <= kSufficiency ? 'Phosphorus' : 'Potassium'} at ${(liebigMin * 100).toFixed(0)}% of optimum.`,
      overapplication
        ? 'Excess nutrient application risks groundwater contamination and economic waste.'
        : 'Nutrient application rates are within environmentally acceptable ranges.',
      `${applicationTiming.replace('_', ' ')} timing improves nutrient use efficiency by ~${(timBonus * 100).toFixed(0)}%.`,
    ],
    yieldEstimate: `${estimatedYield} t/ha`,
    waterUse: 85,
    nutrientEfficiency: Math.round(efficiency * 100),
  };
}

// ─── Pest & Disease Simulation ────────────────────────────────────────────────
// Assumption: untreated stem borer causes 15–50% yield loss in maize.
// Early detection + treatment reduces loss by 60–80%.
// IPM approach further reduces costs by 25%.

export type PestInput = {
  pestType: 'stem_borer' | 'fall_armyworm' | 'aphids' | 'fungal_blight' | 'rust';
  infestationLevel: 'light' | 'moderate' | 'severe';
  treatmentMethod: 'none' | 'chemical' | 'biological' | 'ipm' | 'cultural';
  detectionTiming: 'early' | 'mid' | 'late';
};

export function runPestSimulation(input: PestInput): SimulationResult {
  const { pestType, infestationLevel, treatmentMethod, detectionTiming } = input;

  const baseLoss: Record<string, number> = {
    stem_borer: 0.35, fall_armyworm: 0.45, aphids: 0.20,
    fungal_blight: 0.40, rust: 0.30,
  };
  const severityMultiplier = { light: 0.4, moderate: 0.75, severe: 1.0 };
  const timingMultiplier = { early: 0.4, mid: 0.7, late: 1.0 };
  const treatmentEfficacy: Record<string, number> = {
    none: 0, chemical: 0.80, biological: 0.65, ipm: 0.75, cultural: 0.50,
  };

  const rawLoss = (baseLoss[pestType] ?? 0.3)
    * (severityMultiplier[infestationLevel] ?? 1)
    * (timingMultiplier[detectionTiming] ?? 1);
  const efficacy = treatmentEfficacy[treatmentMethod] ?? 0;
  const finalLoss = rawLoss * (1 - efficacy);
  const affectedArea = Math.round(rawLoss * 100);
  const controlledArea = Math.round(finalLoss * 100);
  const estimatedYield = (8.5 * (1 - finalLoss)).toFixed(1);

  const score = Math.round(Math.max(0, Math.min(100,
    (1 - finalLoss) * 60 + efficacy * 30 + (detectionTiming === 'early' ? 10 : 0)
  )));
  const riskLevel = finalLoss > 0.4 ? 'Critical' : finalLoss > 0.25 ? 'High' : finalLoss > 0.1 ? 'Moderate' : 'Low';

  const pestNames: Record<string, string> = {
    stem_borer: 'Stem Borer', fall_armyworm: 'Fall Armyworm', aphids: 'Aphids',
    fungal_blight: 'Fungal Blight', rust: 'Rust',
  };

  const chartData: ChartPoint[] = [
    { label: 'Affected area', value: affectedArea, color: '#E8503A' },
    { label: 'After treatment', value: controlledArea, color: '#E8B94F' },
    { label: 'Healthy area', value: 100 - controlledArea, color: '#236B45' },
  ];

  return {
    score,
    recommendation:
      treatmentMethod === 'none' && finalLoss > 0.2
        ? `Immediate intervention needed. Apply registered ${pestType.includes('fungal') ? 'fungicide' : 'insecticide'} or introduce biological controls.`
        : treatmentMethod === 'ipm'
          ? 'Excellent choice. Continue IPM: combine scouting, threshold-based spraying and biological agents.'
          : detectionTiming === 'late'
            ? 'Late detection has limited your options. Next season, scout weekly from emergence to grain fill.'
            : `${treatmentMethod.charAt(0).toUpperCase() + treatmentMethod.slice(1)} control is effective for this pest. Monitor fields weekly post-application.`,
    chartData,
    metrics: {
      'Pest': pestNames[pestType] ?? pestType,
      'Infestation': infestationLevel,
      'Detection': detectionTiming,
      'Field affected': `${affectedArea}%`,
      'After treatment': `${controlledArea}%`,
      'Yield estimate': `${estimatedYield} t/ha`,
    },
    riskLevel,
    insights: [
      `${pestNames[pestType]} under ${infestationLevel} infestation causes up to ${(rawLoss * 100).toFixed(0)}% yield loss without treatment.`,
      `${detectionTiming.charAt(0).toUpperCase() + detectionTiming.slice(1)} detection: treatment efficacy ${detectionTiming === 'early' ? 'maximised' : detectionTiming === 'mid' ? 'moderate' : 'significantly reduced'}.`,
      treatmentMethod === 'ipm'
        ? 'IPM reduces pesticide costs by ~25% while maintaining 75% control efficacy.'
        : treatmentMethod === 'chemical'
          ? 'Chemical control is effective but monitor for resistance development after repeated applications.'
          : treatmentMethod === 'biological'
            ? 'Biological control is sustainable and safe. Efficacy improves with regular releases.'
            : 'No treatment will result in cascading infestation and significant economic loss.',
    ],
    yieldEstimate: `${estimatedYield} t/ha`,
    waterUse: 85,
    nutrientEfficiency: 80,
  };
}

// ─── Crop Rotation Simulation ─────────────────────────────────────────────────
// Assumption: Legumes fix 80–150 kg N/ha for following crops.
// Monoculture increases disease pressure by ~15% per consecutive season.
// Diverse rotation improves soil organic matter by ~0.1% per year.

export type RotationInput = {
  season1: string;
  season2: string;
  season3: string;
};

const CROP_N_FIXATION: Record<string, number> = {
  soybeans: 120, beans: 90, groundnuts: 100, maize: 0, wheat: 0,
  tomatoes: 0, potato: 0, sugarcane: 0, sorghum: 0,
};
const CROP_DISEASE_GROUP: Record<string, string> = {
  maize: 'cereal', wheat: 'cereal', sorghum: 'cereal',
  soybeans: 'legume', beans: 'legume', groundnuts: 'legume',
  tomatoes: 'solanaceous', potato: 'solanaceous',
  sugarcane: 'grass', cotton: 'broadleaf',
};

export function runRotationSimulation(input: RotationInput): SimulationResult {
  const seasons = [input.season1, input.season2, input.season3];

  // Nitrogen carryover from legumes
  const nCarryover = seasons.reduce((total, crop, i) => {
    if (i < 2) {
      return total + (CROP_N_FIXATION[crop.toLowerCase()] ?? 0) * 0.4; // 40% carryover
    }
    return total;
  }, 0);

  // Disease pressure from same crop group
  const groups = seasons.map(c => CROP_DISEASE_GROUP[c.toLowerCase()] ?? 'other');
  const consecutive = groups.filter((g, i) => i > 0 && g === groups[i - 1]).length;
  const diseasePressure = Math.min(50, consecutive * 15);

  // Biodiversity bonus
  const uniqueGroups = new Set(groups).size;
  const diversityBonus = uniqueGroups === 3 ? 0.15 : uniqueGroups === 2 ? 0.07 : 0;

  // Final rotation score
  const hasLegume = seasons.some(c => (CROP_N_FIXATION[c.toLowerCase()] ?? 0) > 0);
  const baseScore = 55 + (hasLegume ? 20 : 0) + diversityBonus * 100 - diseasePressure;
  const score = Math.round(Math.max(0, Math.min(100, baseScore)));

  const yieldBonus = nCarryover * 0.008 + diversityBonus - consecutive * 0.08;
  const estimatedYield = (8.5 * (1 + yieldBonus)).toFixed(1);

  const soilN = Math.min(100, 60 + nCarryover * 0.2);
  const soilHealth = Math.min(100, 60 + uniqueGroups * 10 - consecutive * 10);

  const chartData: ChartPoint[] = [
    { label: 'Soil N', value: Math.round(soilN), color: '#236B45' },
    { label: 'Soil health', value: Math.round(soilHealth), color: '#E8B94F' },
    { label: 'Disease pressure', value: diseasePressure, color: '#E8503A' },
    { label: 'Diversity', value: uniqueGroups * 33, color: '#2B7FDE' },
  ];

  const riskLevel = diseasePressure > 30 ? 'High' : diseasePressure > 15 ? 'Moderate' : 'Low';

  return {
    score,
    recommendation:
      consecutive >= 2
        ? `Avoid planting ${seasons[seasons.length - 1]} for 3rd consecutive season. Break the cycle with a legume or unrelated crop.`
        : !hasLegume
          ? 'Include a legume (soybeans, beans) in your rotation to naturally replenish soil nitrogen.'
          : `Your rotation is well-planned. The legume phase contributes ~${nCarryover.toFixed(0)} kg N/ha carryover to the next crop.`,
    chartData,
    metrics: {
      'Season 1': seasons[0],
      'Season 2': seasons[1],
      'Season 3': seasons[2],
      'N carryover': `${nCarryover.toFixed(0)} kg/ha`,
      'Disease pressure': `${diseasePressure}%`,
      'Diversity index': `${uniqueGroups}/3 groups`,
    },
    riskLevel,
    insights: [
      hasLegume
        ? `Legume inclusion fixes ~${nCarryover.toFixed(0)} kg N/ha for the following crop, reducing fertilizer input.`
        : 'No legume in rotation — soil nitrogen will deplete without external fertilizer input.',
      consecutive > 0
        ? `${consecutive} consecutive same-group planting(s) increases soil-borne disease pressure by ~${diseasePressure}%.`
        : 'Excellent diversity — no consecutive same-group crops. Disease pressure is minimised.',
      `Rotation diversity score: ${uniqueGroups}/3 crop groups — ${uniqueGroups === 3 ? 'optimal' : uniqueGroups === 2 ? 'acceptable' : 'monoculture risk'}.`,
    ],
    yieldEstimate: `${estimatedYield} t/ha (season 3 est.)`,
    waterUse: 85,
    nutrientEfficiency: Math.round(60 + nCarryover * 0.2),
  };
}

// ─── Climate Simulation ───────────────────────────────────────────────────────
// Assumption: Maize base temperature = 10°C; optimal = 24°C; ceiling = 35°C.
// Growing degree days (GDD) = max(0, (Tmax+Tmin)/2 - Tbase)
// 1°C rise shifts maturity by ~5 days. Rainfall >100mm/week causes waterlogging.

export type ClimateInput = {
  avgTempC: number;         // average temperature °C (5–45)
  rainfallMmWeek: number;   // weekly rainfall mm (0–200)
  co2Increase: boolean;     // elevated CO2 scenario
  extremeHeatEvents: number; // number of days >38°C per month (0–15)
};

export function runClimateSimulation(input: ClimateInput): SimulationResult {
  const { avgTempC, rainfallMmWeek, co2Increase, extremeHeatEvents } = input;

  // Growing degree days (10°C base)
  const dailyGDD = Math.max(0, Math.min(25, avgTempC - 10)); // cap at ceiling
  const seasonGDD = dailyGDD * 120; // approx 120-day season

  // Optimal GDD for maize ~1500–2200; optimal temp ~18-28°C
  const tempOptimalFactor =
    avgTempC >= 18 && avgTempC <= 28
      ? 1.0
      : avgTempC < 18
        ? Math.max(0.3, 1 - (18 - avgTempC) * 0.04)
        : Math.max(0.2, 1 - (avgTempC - 28) * 0.06);

  // Rainfall factor
  const optimalRainWeek = 40;
  const rainfallFactor =
    rainfallMmWeek >= 20 && rainfallMmWeek <= 60
      ? 1.0
      : rainfallMmWeek < 20
        ? Math.max(0.2, rainfallMmWeek / 20)
        : Math.max(0.4, 1 - (rainfallMmWeek - 60) * 0.008); // waterlogging

  // CO2 fertilisation effect (assumption: +10% yield for doubled CO2 in C3 crops)
  const co2Bonus = co2Increase ? 0.07 : 0; // modest C4 (maize) response

  // Extreme heat penalty
  const heatPenalty = Math.min(0.5, extremeHeatEvents * 0.04);

  const yieldFactor = Math.max(0.05, tempOptimalFactor * rainfallFactor + co2Bonus - heatPenalty);
  const estimatedYield = (8.5 * yieldFactor).toFixed(1);
  const growingDays = seasonGDD > 0 ? Math.round(1800 / (dailyGDD || 1)) : 0;

  const score = Math.round(Math.max(0, Math.min(100,
    tempOptimalFactor * 50 + rainfallFactor * 30 + co2Bonus * 50 - heatPenalty * 60
  )));
  const riskLevel = yieldFactor < 0.4 ? 'Critical' : yieldFactor < 0.65 ? 'High' : yieldFactor < 0.85 ? 'Moderate' : 'Low';

  const chartData: ChartPoint[] = [
    { label: 'Temp factor', value: Math.round(tempOptimalFactor * 100), color: '#E8503A' },
    { label: 'Rain factor', value: Math.round(rainfallFactor * 100), color: '#2B7FDE' },
    { label: 'Yield estimate', value: Math.round(yieldFactor * 100), color: '#236B45' },
    { label: 'Heat stress', value: Math.round(heatPenalty * 100), color: '#E8B94F' },
  ];

  return {
    score,
    recommendation:
      avgTempC > 32
        ? 'High temperature stress. Consider heat-tolerant varieties, shade netting and increased irrigation frequency.'
        : avgTempC < 15
          ? 'Temperature is too low for optimal maize growth. Switch to cool-season crops (wheat, barley) or delay planting.'
          : rainfallMmWeek > 80
            ? 'Excess rainfall risks waterlogging. Improve drainage and consider raised beds.'
            : 'Climate conditions are acceptable. Monitor forecasts and adjust planting dates to maximise GDD accumulation.',
    chartData,
    metrics: {
      'Avg temperature': `${avgTempC}°C`,
      'Weekly rainfall': `${rainfallMmWeek} mm`,
      'Season GDD': `${seasonGDD}`,
      'Est. growing days': `${growingDays} days`,
      'Heat events': `${extremeHeatEvents}/month`,
      'Yield estimate': `${estimatedYield} t/ha`,
    },
    riskLevel,
    insights: [
      `Average temperature of ${avgTempC}°C is ${avgTempC >= 18 && avgTempC <= 28 ? 'optimal' : avgTempC > 28 ? 'above optimal — heat stress likely' : 'below optimal — slow growth expected'}.`,
      rainfallMmWeek > 80
        ? 'Excess rainfall can cause root oxygen deficiency and increased disease pressure.'
        : rainfallMmWeek < 20
          ? 'Very low rainfall — supplemental irrigation is essential for crop survival.'
          : 'Rainfall is within the productive range for most South African summer crops.',
      co2Increase
        ? 'Elevated CO2 provides a small yield benefit for most crops, partially offsetting temperature stress.'
        : extremeHeatEvents > 7
          ? `${extremeHeatEvents} extreme heat days per month significantly disrupts pollen viability and grain set.`
          : 'No significant CO2 or extreme heat impact in this scenario.',
    ],
    yieldEstimate: `${estimatedYield} t/ha`,
    waterUse: Math.round(rainfallFactor * 100),
    nutrientEfficiency: Math.round(tempOptimalFactor * 90),
  };
}
