const Shipment = require("../models/Shipment");
const mongoose = require("mongoose");

// In-memory fallback for demo mode
let memoryShipments = [];

exports.createShipment = async (req, res) => {
  try {
    const { medicineId, sender, receiver, trackingId } = req.body;

    if (!medicineId || !sender || !receiver || !trackingId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const shipmentData = {
      medicineId,
      sender,
      receiver,
      trackingId,
      status: "Pending",
      note: "",
    };

    // Try DB first
    if (mongoose.connection.readyState === 1) {
      const shipment = new Shipment(shipmentData);
      await shipment.save();
    } else {
      memoryShipments.push(shipmentData);
    }

    res.status(201).json({ message: "Shipment created", shipment: shipmentData });

  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ error: "Error creating shipment" });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {
    const { trackingId, status, note } = req.body;
    let shipment;

    if (mongoose.connection.readyState === 1) {
      shipment = await Shipment.findOne({ trackingId });
      if (shipment) {
        shipment.status = status;
        if (note) shipment.note = note;
        await shipment.save();
      }
    } else {
      shipment = memoryShipments.find(s => s.trackingId === trackingId);
      if (shipment) {
        shipment.status = status;
        if (note) shipment.note = note;
      }
    }

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    res.status(200).json({ message: 'Shipment status updated successfully', shipment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shipment status', error: error.message });
  }
};

exports.getAllShipments = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const shipments = await Shipment.find();
      res.json(shipments);
    } else {
      res.json(memoryShipments);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};