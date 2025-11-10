import { Router } from "express";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const publicStudentStatsRouterFactory = ({ pool }) => {
  const router = Router();

  router.get(
    "/students",
    asyncHandler(async (req, res) => {
      try {
        const [rows] = await pool.execute(
          "SELECT COUNT(*) as total FROM students WHERE is_active = 1 AND is_deleted = 0"
        );
        const totalStudents = rows[0].total;
        res.json({ totalStudents });
      } catch {
        res.status(500).json({ error: "Failed to fetch student statistics" });
      }
    })
  );

  return router;
};

export default publicStudentStatsRouterFactory;
