import {
  getCustomerByUserId,
} from "./customer.service.js";

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