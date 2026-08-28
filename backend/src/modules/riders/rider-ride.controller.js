import {
  getAvailableRides,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
} from "./rider-ride.service.js";

export const getMyAvailableRides = async (req, res, next) => {
  try {
    const rides = await getAvailableRides(req.user.id);

    if (!rides) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found.",
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

export const acceptMyRide = async (req, res, next) => {
  try {
    const ride = await acceptRide(
      req.user.id,
      req.params.rideId
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or is no longer available.",
      });
    }

    res.status(200).json({
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
    const ride = await startRide(
      req.user.id,
      req.params.rideId
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be started.",
      });
    }

    res.status(200).json({
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
    const ride = await completeRide(
      req.user.id,
      req.params.rideId
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be completed.",
      });
    }

    res.status(200).json({
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
    const ride = await cancelRide(
      req.user.id,
      req.params.rideId
    );

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