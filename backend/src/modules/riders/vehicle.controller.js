import {
  getVehiclesByUserId,
  createVehicle,
  updateVehicle,
} from "./vehicle.service.js";

import {
  createVehicleSchema,
  updateVehicleSchema,
} from "./vehicle.validation.js";

export const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await getVehiclesByUserId(req.user.id);

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const addMyVehicle = async (req, res, next) => {
  try {
    const data = createVehicleSchema.parse(req.body);

    const vehicle = await createVehicle(req.user.id, data);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully.",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyVehicle = async (req, res, next) => {
  try {
    const data = updateVehicleSchema.parse(req.body);

    const vehicle = await updateVehicle(
      req.user.id,
      req.params.vehicleId,
      data
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};
