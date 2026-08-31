
import {
  getAvailableRides,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
} from "./rider-ride.service.js";

import { rideIdParamSchema } from "./rider.validation.js";

const validateRideId = (req, res) => {
  const result = rideIdParamSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid ride ID.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  return result.data.rideId;
};

export const getMyAvailableRides = async (req, res, next) => {
  try {
    const rides = await getAvailableRides(req.user.id);

    if (!rides) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptMyRide = async (req, res, next) => {
  try {
    const rideId = validateRideId(req, res);

    if (!rideId) {
      return;
    }

    const ride = await acceptRide(
      req.user.id,
      rideId
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or is no longer available.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride accepted successfully.",
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const startMyRide = async (req, res, next) => {
  try {
    const rideId = validateRideId(req, res);

    if (!rideId) {
      return;
    }

    const ride = await startRide(
      req.user.id,
      rideId
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be started.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride started successfully.",
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const completeMyRide = async (req, res, next) => {
  try {
    const rideId = validateRideId(req, res);

    if (!rideId) {
      return;
    }

    const ride = await completeRide(
      req.user.id,
      rideId
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be completed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride completed successfully.",
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyRide = async (req, res, next) => {
  try {
    const rideId = validateRideId(req, res);

    if (!rideId) {
      return;
    }

    const ride = await cancelRide(
      req.user.id,
      rideId
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be cancelled.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride cancelled successfully.",
      ride,
    });
  } catch (error) {
    next(error);
  }
};
