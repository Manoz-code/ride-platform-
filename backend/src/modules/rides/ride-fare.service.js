import { query } from "../../config/database.js";

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const calculateRideFare = async ({
  market,
  serviceType,
  distanceMeters,
  durationSeconds,
}) => {
  const fareRuleResult = await query(
    `
      SELECT
        id,
        market,
        service_type,
        currency,
        base_fare,
        minimum_fare,
        per_km_fare,
        per_minute_fare,
        free_waiting_minutes,
        waiting_per_minute_fare,
        platform_commission_percent,
        tax_percent,
        max_surge_multiplier
      FROM fare_rules
      WHERE market = $1
        AND service_type = $2
        AND is_active = TRUE
        AND effective_from <= NOW()
        AND (
          effective_to IS NULL
          OR effective_to > NOW()
        )
      LIMIT 1
    `,
    [market, serviceType]
  );

  const rule = fareRuleResult.rows[0];

  if (!rule) {
    const error = new Error(
      `No active fare rule found for ${market} / ${serviceType}.`
    );
    error.statusCode = 422;
    throw error;
  }

  const distanceKm = Number(distanceMeters) / 1000;
  const durationMinutes = Number(durationSeconds) / 60;

  const baseFare = Number(rule.base_fare);

  const distanceFare = distanceKm * Number(rule.per_km_fare);

  const timeFare = durationMinutes * Number(rule.per_minute_fare);

  const waitingFare = 0;

  const tollFare = 0;

  const surgeMultiplier = 1;

  const surgeFare =
    (baseFare + distanceFare + timeFare + waitingFare + tollFare) *
    (surgeMultiplier - 1);

const subtotalBeforeMinimum =
  roundMoney(baseFare) +
  roundMoney(distanceFare) +
  roundMoney(timeFare) +
  roundMoney(waitingFare) +
  roundMoney(tollFare) +
  roundMoney(surgeFare);

  const subtotal = Math.max(
    subtotalBeforeMinimum,
    Number(rule.minimum_fare)
  );

  const discountFare = 0;

  const taxableAmount = subtotal - discountFare;

  const taxFare =
    taxableAmount * (Number(rule.tax_percent) / 100);

  const totalFare = taxableAmount + taxFare;

  const platformCommissionFare =
    totalFare *
    (Number(rule.platform_commission_percent) / 100);

  const riderEarningFare =
    totalFare - platformCommissionFare;

  return {
    fareRuleId: rule.id,

    routeDistanceMeters: Number(distanceMeters),
    estimatedDurationSeconds: Number(durationSeconds),

    baseFare: roundMoney(baseFare),
    distanceFare: roundMoney(distanceFare),
    timeFare: roundMoney(timeFare),
    waitingFare: roundMoney(waitingFare),
    tollFare: roundMoney(tollFare),

    surgeMultiplier,
    surgeFare: roundMoney(surgeFare),

    subtotal: roundMoney(subtotal),
    discountFare: roundMoney(discountFare),
    taxFare: roundMoney(taxFare),
    totalFare: roundMoney(totalFare),

    platformCommissionFare: roundMoney(platformCommissionFare),
    riderEarningFare: roundMoney(riderEarningFare),

    currency: rule.currency,
  };
};
