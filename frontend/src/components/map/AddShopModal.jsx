import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Store, Box, MonitorSmartphone } from "lucide-react";

export function AddShopModal({ open, position, onSave, onCancel }) {
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  
  const [name, setName] = useState("");
  const [type, setType] = useState("shop"); // 'shop' | 'warehouse' | 'pos'
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !position) return;
    
    // Reset form
    setName("");
    setType("shop");
    setAddress("");
    
    let isMounted = true;
    setLoadingAddress(true);

    const reverseGeocode = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`, {
          headers: { "User-Agent": "StartupSeekerApp/1.0" }
        });
        const data = await res.json();
        if (isMounted && data && data.display_name) {
          setAddress(data.display_name.split(",").slice(0, 3).join(",")); 
        } else if (isMounted) {
          setAddress("Unknown Location");
        }
      } catch (err) {
        if (isMounted) setAddress("Unable to load address");
      } finally {
        if (isMounted) setLoadingAddress(false);
      }
    };
    
    reverseGeocode();
    
    return () => { isMounted = false; };
  }, [open, position]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSaving(true);
    await onSave({
      name,
      type,
      lat: position.lat,
      lng: position.lng,
      address
    });
    setSaving(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111118] shadow-2xl overflow-hidden"
          >
            <div className="bg-[#1a1a2e] p-4 flex items-center gap-3 border-b border-white/5">
              <MapPin className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-white">Save Private Location</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#aaaabb] font-semibold">Coordinates & Address</label>
                <div className="text-sm bg-black/30 p-2.5 rounded-lg border border-white/5 text-[#f0f0f0]">
                  {loadingAddress ? (
                     <span className="flex items-center gap-2 text-emerald-400 text-xs">
                       <Loader2 className="w-4 h-4 animate-spin" /> Locating...
                     </span>
                  ) : (
                    <span className="line-clamp-2 text-xs">{address || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#aaaabb] font-semibold" htmlFor="shopName">Location Name</label>
                <input
                  id="shopName"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Main Downtown Store"
                  className="w-full bg-black/40 border border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-lg p-2.5 text-sm text-white outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#aaaabb] font-semibold">Location Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setType("shop")} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition ${type === 'shop' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-black/20 border-white/10 text-[#aaaabb]'}`}>
                    <Store className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase font-bold">Shop</span>
                  </button>
                  <button type="button" onClick={() => setType("warehouse")} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition ${type === 'warehouse' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-black/20 border-white/10 text-[#aaaabb]'}`}>
                    <Box className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase font-bold">Warehouse</span>
                  </button>
                  <button type="button" onClick={() => setType("pos")} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition ${type === 'pos' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-black/20 border-white/10 text-[#aaaabb]'}`}>
                    <MonitorSmartphone className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase font-bold">POS</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-transparent text-[#aaaabb] font-semibold text-sm hover:bg-white/5 transition">
                  Cancel
                </button>
                <button type="submit" disabled={!name.trim() || saving || loadingAddress} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Drop Pin"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
