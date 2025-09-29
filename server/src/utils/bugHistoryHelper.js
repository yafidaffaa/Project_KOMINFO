const statusMessages = {
  // dibuat & diajukan → pencatat, user_umum, admin_sa, admin_kategori
  dibuat: (user) => {
    if (user.role === 'admin_kategori') {
      return `Admin (${user.username}) membuat laporan bug.`;
    }
    return `Laporan bug dibuat oleh ${user.role} (${user.username}).`;
  },

  diajukan: (user) => {
    if (user.role === 'admin_kategori') {
      return `Admin (${user.username}) mengajukan kembali laporan bug setelah revisi.`;
    }
    return `Laporan bug diajukan oleh ${user.role} (${user.username}).`;
  },

  // diproses → validator, admin_sa
  diproses: (user) => {
    if (user.role === 'validator') {
      return `Validator (${user.username}) menugaskan bug untuk diproses teknisi.`;
    }
    if (user.role === 'admin_sa') {
      return `Admin SA (${user.username}) menandai bug sebagai diproses.`;
    }
    return `Status bug diproses oleh ${user.role} (${user.username}).`;
  },

  // revisi_by_admin → validator, admin_sa
  revisi_by_admin: (user) => {
    if (user.role === 'validator') {
      return `Validator (${user.username}) meminta revisi laporan bug.`;
    }
    if (user.role === 'admin_sa') {
      return `Admin SA (${user.username}) meminta revisi laporan bug.`;
    }
    return `Laporan bug direvisi oleh ${user.role} (${user.username}).`;
  },

  // selesai → teknisi, admin_sa
  selesai: (user) => {
    if (user.role === 'teknisi') {
      return `Teknisi (${user.username}) menyelesaikan perbaikan bug.`;
    }
    if (user.role === 'admin_sa') {
      return `Admin SA (${user.username}) menandai bug sudah selesai.`;
    }
    return `Bug dinyatakan selesai oleh ${user.role} (${user.username}).`;
  },

  // pendapat_selesai → teknisi, admin_sa
  pendapat_selesai: (user) => {
    if (user.role === 'teknisi') {
      return `Teknisi (${user.username}) memberikan pendapat bahwa bug sudah selesai.`;
    }
    if (user.role === 'admin_sa') {
      return `Admin SA (${user.username}) memberikan pendapat bahwa bug sudah selesai.`;
    }
    return `Status pendapat_selesai diubah oleh ${user.role} (${user.username}).`;
  },

  // disetujui / tidak_disetujui → validator, admin_sa
  disetujui: (user) => {
    if (user.role === 'validator') {
      return `Validator (${user.username}) menyetujui laporan bug yang sudah dikerjakan oleh teknisi.`;
    }
    if (user.role === 'admin_sa') {
      return `Admin SA (${user.username}) menyetujui laporan bug yang sudah dikerjakan oleh teknisi.`;
    }
    return `Laporan bug disetujui oleh ${user.role} (${user.username}).`;
  },

  tidak_disetujui: (user) => {
    if (user.role === 'validator') {
      return `Validator (${user.username}) menolak laporan bug yang sudah dikerjakan oleh teknisi dan laporan bug harus kembali diproses oleh teknisi.`;
    }
    if (user.role === 'admin_sa') {
      return `Admin SA (${user.username}) menolak laporan bug yang sudah dikerjakan oleh teknisi dan laporan bug harus kembali diproses oleh teknisi.`;
    }
    return `Laporan bug ditolak oleh ${user.role} (${user.username}).`;
  },

  // khusus admin_sa (aksi terhadap bug assign)
  'Bug assign dihapus admin_sa': (user) =>
    `Admin SA (${user.username}) menghapus bug assign.`,

  'Admin_sa melakukan update bug assign': (user) =>
    `Admin SA (${user.username}) memperbarui bug assign.`
};

const generateKeterangan = (status, user) => {
  const generator = statusMessages[status];
  return generator
    ? generator(user)
    : `Status diperbarui ke ${status} oleh ${user.role} (${user.username}).`;
};

module.exports = { generateKeterangan };
