import {
  approveRider,
  approveVehicle,
  getPendingRiders,
  getPendingVehicles,
} from "./admin.service.js";

export const getPendingRiderApprovals = async (req, res, next) => {
  try {
    const riders = await getPendingRiders();

    res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    next(error);
  }
};

export const approveRiderProfile = async (req, res, next) => {
  try {
    const rider = await approveRider(req.params.riderId);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Pending rider not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Rider approved successfully.",
      rider,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingVehicleApprovals = async (req, res, next) => {
  try {
    const vehicles = await getPendingVehicles();

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const approveVehicleProfile = async (req, res, next) => {
  try {
    const vehicle = await approveVehicle(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Pending vehicle not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle approved successfully.",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};