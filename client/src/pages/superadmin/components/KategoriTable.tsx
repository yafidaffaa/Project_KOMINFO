import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import { deleteBugCategory, fetchBugCategories, type BugCategory } from "../../../services/BugCategoryServices";
import BugCategoryFormModal from "../BugCategoryFormModal";
import { Plus } from "lucide-react";


const KategoriTable: React.FC = () => {
  const [kategori, setKategori] = useState<BugCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<BugCategory | null>(
    null
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBugCategories();
      setKategori(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus kategori ini?")) return;
    await deleteBugCategory(id);
    loadData();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="pt-6 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Daftar Layanan Kategori</h2>
        <button
          className="bg-black text-white p-2 rounded-full hover:bg-gray-800"
          onClick={() => {
            setModalMode("create");
            setSelectedCategory(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse bg-white rounded-lg">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Kategori</th>
              {/* <th className="px-4 py-2 border">Deskripsi</th> */}
              <th className="px-4 py-2 text-left">Validator</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {kategori.map((row, index) => (
              <tr key={row.id} className="text-center">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{row.nama_layanan}</td>
                {/* <td className="border px-4 py-2">{row.deskripsi}</td> */}
                <td className="border px-4 py-2">{row.validator?.nama}</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      className="bg-yellow-500 text-white"
                      onClick={() => {
                        setModalMode("edit");
                        setSelectedCategory(row);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 text-white"
                      onClick={() => handleDelete(row.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <BugCategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
        mode={modalMode}
        initialData={selectedCategory}
      />
    </div>
  );
};

export default KategoriTable;
