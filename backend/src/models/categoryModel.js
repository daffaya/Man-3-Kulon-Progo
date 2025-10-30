const createCategoryModel = ({ pool }) => {
  const model = {
    // Ambil semua kategori, urut berdasarkan nama
    findAll: async () => {
      const [rows] = await pool.execute(
        `SELECT id, name, slug, description, created_at, updated_at 
         FROM categories 
         ORDER BY name ASC`
      );
      return rows;
    },

    // Ambil kategori berdasarkan ID
    findById: async (id) => {
      const [rows] = await pool.execute(
        `SELECT id, name, slug, description, created_at, updated_at 
         FROM categories 
         WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    },

    // Hapus kategori berdasarkan ID
    delete: async (id) => {
      const [result] = await pool.execute(
        `DELETE FROM categories WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    },
  };

  // Buat slug dari nama
  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // hapus karakter khusus
      .replace(/\s+/g, "-") // spasi jadi "-"
      .replace(/-+/g, "-"); // hapus tanda hubung berulang

  // Tambahkan metode create
  model.create = async ({ name, description }) => {
    const slug = generateSlug(name);
    const [result] = await pool.execute(
      `INSERT INTO categories (name, slug, description, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [name, slug, description]
    );
    return await model.findById(result.insertId);
  };

  // Tambahkan metode update
  model.update = async (id, { name, description }) => {
    const slug = generateSlug(name);
    const [result] = await pool.execute(
      `UPDATE categories 
       SET name = ?, slug = ?, description = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, slug, description, id]
    );
    if (result.affectedRows === 0) return null;
    return await model.findById(id);
  };

  return model;
};

export default createCategoryModel;
