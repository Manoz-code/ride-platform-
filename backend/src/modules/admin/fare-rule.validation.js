const VEHICLE_TYPES = ["bike", "car"];

export const validateFareRuleInput = (body) => {
  const errors = [];

  const requiredFields = [
    "market",
    "serviceType",
    "baseFare",
    "minimumFare",
    "perKmFare",
    "perMinuteFare",
  ];

  for (const field of requiredFields) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
    ) {
      errors.push(`${field} is required.`);
    }
  }

  if (
    body.serviceType !== undefined &&
    !VEHICLE_TYPES.includes(body.serviceType)
  ) {
    errors.push("serviceType must be either bike or car.");
  }

  const numericFields = [
    "baseFare",
    "minimumFare",
    "perKmFare",
    "perMinuteFare",
    "freeWaitingMinutes",
    "waitingPerMinuteFare",
    "platformCommissionPercent",
    "taxPercent",
    "maxSurgeMultiplier",
  ];

  for (const field of numericFields) {
    if (body[field] !== undefined) {
      const value = Number(body[field]);

      if (!Number.isFinite(value) || value < 0) {
        errors.push(`${field} must be a non-negative number.`);
      }
    }
  }

  if (
    body.platformCommissionPercent !== undefined &&
    Number(body.platformCommissionPercent) > 100
  ) {
    errors.push("platformCommissionPercent cannot exceed 100.");
  }

  if (
    body.taxPercent !== undefined &&
    Number(body.taxPercent) > 100
  ) {
    errors.push("taxPercent cannot exceed 100.");
  }

  if (
    body.maxSurgeMultiplier !== undefined &&
    Number(body.maxSurgeMultiplier) < 1
  ) {
    errors.push("maxSurgeMultiplier must be at least 1.");
  }

  return errors;
};
