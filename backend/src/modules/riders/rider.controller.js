import {
  getRiderByUserId,
  updateRiderAvailability,
} from "./rider.service.js";

import { updateAvailabilitySchema } from "./rider.validation.js";

export const getMyRiderProfile = async (req, res, next) => {
  try {
    const rider = await getRiderByUserId(req.user.id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      rider,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyAvailability = async (req, res, next) => {
  try {
    const data = updateAvailabilitySchema.parse(req.body);

    const rider = await updateRiderAvailability(
      req.user.id,
      data.availabilityStatus
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Rider availability updated successfully.",
      rider,
    });
  } catch (error) {
    next(error);
  }
};