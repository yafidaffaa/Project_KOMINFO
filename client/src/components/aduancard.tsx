import React from "react";
import { User } from "lucide-react";

const AduanCard = () => {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm text-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold">JSS</h4>
        <div className="flex items-center gap-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
          <span>Status: Proses</span>
        </div>
      </div>
      <p className="mb-4 text-gray-700">
        verifikasi struktural, gagal dg keterangan terlampir. terjadi pada permohonan tertentu saja.
      </p>
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        <User size={16} />
        <span>Oleh: NamaUser</span>
        <span>|</span>
        <span>12 Juni 2025, 10:00 WIB</span>
      </div>
    </div>
  );
};

export default AduanCard;
