import {
  createFareRule,
  getFareRules,
  getFareRuleById,
  updateFareRule,
} from "./fare-rule.service.js";

import { validateFareRuleInput } from "./fare-rule.validation.js";

export const createFareRuleController = async (req, res, next) => {
  try {
    const errors = validateFareRuleInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid fare rule.",
        errors,
      });
    }

    const fareRule = await createFareRule({
      market: req.body.market,
      serviceType: req.body.serviceType,
      currency: req.body.currency ?? "NPR",
      baseFare: req.body.baseFare,
      minimumFare: req.body.minimumFare,
      perKmFare: req.body.perKmFare,
      perMinuteFare: req.body.perMinuteFare,
      freeWaitingMinutes: req.body.freeWaitingMinutes ?? 3,
      waitingPerMinuteFare: req.body.waitingPerMinuteFare ?? 0,
      platformCommissionPercent:
        req.body.platformCommissionPercent ?? 0,
      taxPercent: req.body.taxPercent ?? 0,
      maxSurgeMultiplier:
        req.body.maxSurgeMultiplier ?? 2,
      isActive: req.body.isActive ?? true,
      effectiveFrom: req.body.effectiveFrom,
effectiveTo: req.body.effectiveTo,
    });

    res.status(201).json({
      success: true,
      message: "Fare rule created successfully.",
      fareRule,
    });
  } catch (error) {
    next(error);
  }
};

export const getFareRulesController = async (req, res, next) => {
  try {
    const fareRules = await getFareRules();

    res.status(200).json({
      success: true,
      fareRules,
    });
  } catch (error) {
    next(error);
  }
};

export const getFareRuleController = async (req, res, next) => {
  try {
    const fareRule = await getFareRuleById(req.params.id);

    if (!fareRule) {
      return res.status(404).json({
        success: false,
        message: "Fare rule not found.",
      });
    }

    res.status(200).json({
      success: true,
      fareRule,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFareRuleController = async (req, res, next) => {
  try {
    const fareRule = await updateFareRule(req.params.id, req.body);

    if (!fareRule) {
      return res.status(404).json({
        success: false,
        message: "Fare rule not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fare rule updated successfully.",
      fareRule,
    });
  } catch (error) {
    next(error);
  }
};
