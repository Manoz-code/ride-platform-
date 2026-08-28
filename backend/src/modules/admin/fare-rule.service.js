import { query } from "../../config/database.js";

export const createFareRule = async (data) => {
  const result = await query(
    `
      INSERT INTO fare_rules (
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
        max_surge_multiplier,
        is_active
        ${data.effectiveFrom ? ", effective_from" : ""}
        ${data.effectiveTo ? ", effective_to" : ""}
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
        ${data.effectiveFrom ? ", $14" : ""}
        ${data.effectiveTo ? `, $${data.effectiveFrom ? 15 : 14}` : ""}
      )
      RETURNING *
    `,
    [
      data.market,
      data.serviceType,
      data.currency,
      data.baseFare,
      data.minimumFare,
      data.perKmFare,
      data.perMinuteFare,
      data.freeWaitingMinutes,
      data.waitingPerMinuteFare,
      data.platformCommissionPercent,
      data.taxPercent,
      data.maxSurgeMultiplier,
      data.isActive,
      ...(data.effectiveFrom ? [data.effectiveFrom] : []),
      ...(data.effectiveTo ? [data.effectiveTo] : []),
    ]
  );

  return result.rows[0];
};

export const getFareRules = async () => {
  const result = await query(`
    SELECT *
    FROM fare_rules
    ORDER BY market ASC, service_type ASC, created_at DESC
  `);

  return result.rows;
};

export const getFareRuleById = async (id) => {
  const result = await query(
    `
      SELECT *
      FROM fare_rules
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

export const updateFareRule = async (id, data) => {
  const result = await query(
    `
      UPDATE fare_rules
      SET
        market = COALESCE($2, market),
        service_type = COALESCE($3, service_type),
        currency = COALESCE($4, currency),
        base_fare = COALESCE($5, base_fare),
        minimum_fare = COALESCE($6, minimum_fare),
        per_km_fare = COALESCE($7, per_km_fare),
        per_minute_fare = COALESCE($8, per_minute_fare),
        free_waiting_minutes = COALESCE($9, free_waiting_minutes),
        waiting_per_minute_fare = COALESCE($10, waiting_per_minute_fare),
        platform_commission_percent = COALESCE($11, platform_commission_percent),
        tax_percent = COALESCE($12, tax_percent),
        max_surge_multiplier = COALESCE($13, max_surge_multiplier),
        is_active = COALESCE($14, is_active),
        effective_from = COALESCE($15, effective_from),
        effective_to = $16,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      data.market ?? null,
      data.serviceType ?? null,
      data.currency ?? null,
      data.baseFare ?? null,
      data.minimumFare ?? null,
      data.perKmFare ?? null,
      data.perMinuteFare ?? null,
      data.freeWaitingMinutes ?? null,
      data.waitingPerMinuteFare ?? null,
      data.platformCommissionPercent ?? null,
      data.taxPercent ?? null,
      data.maxSurgeMultiplier ?? null,
      data.isActive ?? null,
      data.effectiveFrom ?? null,
      data.effectiveTo ?? null,
    ]
  );

  return result.rows[0] || null;
};
