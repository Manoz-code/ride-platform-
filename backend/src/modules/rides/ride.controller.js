import {
  createRide,
  getCustomerRides,
  getCustomerRideById,
  cancelCustomerRide,
} from "./ride.service.js";
import { createRideSchema } from "./ride.validation.js";

export const requestRide = async (req, res, next) => {
  try {
    const data = createRideSchema.parse(req.body);

    const ride = await createRide({
      customerId: req.user.id,
      ...data,
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found.",
      });
    }

    res.status(201).json({
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRides = async (req, res, next) => {
  try {
    const rides = await getCustomerRides(req.user.id);

    if (!rides) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRideById = async (req, res, next) => {
  try {
    const ride = await getCustomerRideById(req.user.id, req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found.",
      });
    }

    res.status(200).json({
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyRide = async (req, res, next) => {
  try {
    const ride = await cancelCustomerRide(req.user.id, req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be cancelled.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully.",
      ride,
    });
  } catch (error) {
    next(error);
  }
};