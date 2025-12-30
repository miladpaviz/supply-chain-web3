import { useState, useEffect, useContext } from "react";
import { addShipment, getAllShipments } from "../services/api";
import { Web3Context } from "../context/Web3Provider";
import axios from "axios";
import {
  Truck, Package, User, CheckCircle, AlertCircle,
  Loader, BarChart3, RefreshCw, Tag, FileText
} from "lucide-react";

const Shipments = () => {
  // 1. Context Check & Debugging
  const { contract, account } = useContext(Web3Context);
  console.log("Web3 Status:", { contract: !!contract, account });

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateStatusText, setUpdateStatusText] = useState("Update");
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const [formData, setFormData] = useState({
    medicineId: "",
    sender: "",
    receiver: "",
    trackingId: "",
  });

  const [updateData, setUpdateData] = useState({
    trackingId: "",
    status: "",
    note: "",
  });

  const statusEnum = {
    "Pending": 0,
    "InTransit": 1,
    "Delivered": 2
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await getAllShipments();
      setShipments(response.data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 5000);
  };

  // 2. MetaMask Trigger for Creation
  const handleAddShipment = async (e) => {
    e.preventDefault();
    if (!contract || !account) {
      showNotification("error", "Web3 not connected. Check MetaMask.");
      return;
    }

    try {
      setSubmitting(true);
      showNotification("info", "Waiting for Blockchain signature...");

      // Blockchain Tx
      await contract.methods.createShipment(
        formData.medicineId,
        formData.receiver,
        formData.trackingId
      ).send({ from: account, gas: 500000 });

      // API Sync
      await addShipment(formData);

      showNotification("success", "Shipment created on-chain!");
      fetchShipments();
      setFormData({ medicineId: "", sender: "", receiver: "", trackingId: "" });
    } catch (error) {
      console.error("Create Error:", error);
      showNotification("error", "Creation failed: " + (error.reason || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. MetaMask Trigger for Update & API Path Fix
  const handleUpdateShipmentStatus = async (e) => {
    e.preventDefault();

    if (!contract || !account) {
      showNotification("error", "Web3 not connected.");
      return;
    }

    try {
      setUpdating(true);
      setUpdateStatusText("Checking...");

      // Pre-check
      const onChain = await contract.methods.shipments(updateData.trackingId).call();
      if (onChain.sender === "0x0000000000000000000000000000000000000000") {
        showNotification("error", "Shipment ID not found on Blockchain.");
        setUpdating(false);
        setUpdateStatusText("Update");
        return;
      }

      setUpdateStatusText("Waiting for Signature...");
      const statusIndex = statusEnum[updateData.status];

      // BLOCKCHAIN EXECUTION
      await contract.methods
        .updateShipmentStatusWithNote(updateData.trackingId, statusIndex, updateData.note)
        .send({ from: account, gas: 500000 });

      setUpdateStatusText("Syncing DB...");

      // API PATH FIX
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${API_BASE}/api/shipments/update`, {
        trackingId: updateData.trackingId,
        status: updateData.status,
        note: updateData.note
      });

      showNotification("success", "Status updated successfully!");
      fetchShipments();
      setUpdateData({ trackingId: "", status: "", note: "" });

    } catch (error) {
      console.error("Update Error:", error);
      showNotification("error", "Update failed: " + (error.reason || error.message));
    } finally {
      setUpdating(false);
      setUpdateStatusText("Update");
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "InTransit": "bg-blue-100 text-blue-800",
      "Delivered": "bg-green-100 text-green-800"
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-800 py-16 text-white">
      <div className="container mx-auto px-4">
        {notification.show && (
          <div className={`mb-6 p-4 rounded-lg ${notification.type === "success" ? "bg-green-600" : "bg-red-600 shadow-lg"}`}>
            {notification.message}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <Truck className="mr-2" /> Shipment Control Center
          </h2>
          <div className="text-xs font-mono bg-gray-700 p-2 rounded border border-gray-600">
            Wallet: {account || "Disconnected"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Form */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center text-teal-400">
              <Package className="mr-2" /> 1. Dispatch New Shipment
            </h3>
            <form onSubmit={handleAddShipment} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Medicine ID</label>
                <input type="text" placeholder="e.g. 101" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-teal-500 outline-none" value={formData.medicineId} onChange={e => setFormData({ ...formData, medicineId: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Receiver Address</label>
                <input type="text" placeholder="0x..." className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-teal-500 outline-none font-mono text-sm" value={formData.receiver} onChange={e => setFormData({ ...formData, receiver: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Tracking ID</label>
                <input type="text" placeholder="e.g. TX99" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-teal-500 outline-none" value={formData.trackingId} onChange={e => setFormData({ ...formData, trackingId: e.target.value })} required />
              </div>
              <button disabled={submitting} className="w-full bg-teal-600 p-3 rounded font-bold hover:bg-teal-500 transition-all flex justify-center items-center">
                {submitting ? <Loader className="animate-spin mr-2" /> : <Package className="mr-2" />}
                {submitting ? "Processing..." : "Register on Blockchain"}
              </button>
            </form>
          </div>

          {/* Update Form */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center text-amber-400">
              <RefreshCw className="mr-2" /> 2. Update Progress
            </h3>
            <form onSubmit={handleUpdateShipmentStatus} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Tracking ID</label>
                <input type="text" placeholder="e.g. TX99" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-amber-500 outline-none" value={updateData.trackingId} onChange={e => setUpdateData({ ...updateData, trackingId: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">New Status</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-amber-500 outline-none" value={updateData.status} onChange={e => setUpdateData({ ...updateData, status: e.target.value })} required>
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="InTransit">In-Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Status Note</label>
                <textarea placeholder="e.g. Arrived at distribution center" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-amber-500 outline-none" rows="2" value={updateData.note} onChange={e => setUpdateData({ ...updateData, note: e.target.value })} />
              </div>
              <button disabled={updating} className="w-full bg-amber-600 p-3 rounded font-bold hover:bg-amber-500 transition-all flex justify-center items-center">
                {updating ? <Loader className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
                {updating ? updateStatusText : "Sign Update Transaction"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-xl font-bold flex items-center">
                <BarChart3 className="mr-2 text-teal-500" /> Historical Records
              </h3>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-400">
                {shipments.length} Total
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader className="animate-spin h-10 w-10 mx-auto text-teal-500" />
                <p className="text-gray-500 mt-4">Consulting Blockchain Ledger...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shipments.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-gray-600">
                    No shipments found. Create your first one to see it here.
                  </div>
                ) : shipments.map(s => (
                  <div key={s.trackingId} className="bg-gray-800 p-5 rounded-lg border-l-4 border-teal-500 hover:border-teal-400 transition-all shadow-md group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-teal-400 font-mono">#{s.trackingId}</span>
                          {getStatusBadge(s.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Med ID: {s.medicineId}</p>
                      </div>
                      <Package className="h-4 w-4 text-gray-700 group-hover:text-teal-500 transition-colors" />
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="text-[10px] text-gray-500 uppercase">Destination</div>
                      <div className="text-xs font-mono bg-black bg-opacity-30 p-2 rounded truncate border border-gray-700">
                        {s.receiver}
                      </div>
                    </div>

                    {s.note && (
                      <div className="mt-4 bg-amber-900 bg-opacity-20 border border-amber-800 border-opacity-30 p-3 rounded-md">
                        <div className="flex items-center text-[10px] text-amber-500 uppercase mb-1">
                          <FileText className="h-3 w-3 mr-1" /> Update Note
                        </div>
                        <p className="text-sm text-amber-200 italic font-serif">"{s.note}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipments;