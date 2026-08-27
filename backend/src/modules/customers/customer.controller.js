import {
  getCustomerByUserId,
  updateCustomerByUserId,
} from "./customer.service.js";

import { updateCustomerSchema } from "./customer.validation.js";

export const getMyCustomerProfile = async (req, res, next) => {
  try {
    const customer = await getCustomerByUserId(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyCustomerProfile = async (req, res, next) => {
  try {
    const data = updateCustomerSchema.parse(req.body);

    const customer = await updateCustomerByUserId(
      req.user.id,
      data.fullName
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};