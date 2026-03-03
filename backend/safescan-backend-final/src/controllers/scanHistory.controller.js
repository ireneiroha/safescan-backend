const db = require('../db');

/**
 * GET /api/scans
 * Protected route (JWT required)
 * Returns paginated scan history for the logged-in user
 * Includes productCategory and summary counts (safeCount, riskyCount, restrictedCount)
 */
exports.getScanHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await db.query(
      'SELECT COUNT(*) FROM scans WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get scans with ingredient summary
    // Summary counts: safeCount (LOW), riskyCount (MEDIUM), restrictedCount (HIGH)
    // Using lowercase comparison for risk values: 'safe', 'risky', 'restricted'
    const scansResult = await db.query(
      `SELECT 
        s.id,
        s.created_at,
        s.ocr_text as "extractedText",
        s.product_category as "productCategory",
        COALESCE(
          json_build_object(
            'safeCount', SUM(CASE WHEN LOWER(si.risk) = 'safe' THEN 1 ELSE 0 END),
            'riskyCount', SUM(CASE WHEN LOWER(si.risk) = 'risky' THEN 1 ELSE 0 END),
            'restrictedCount', SUM(CASE WHEN LOWER(si.risk) = 'restricted' THEN 1 ELSE 0 END)
          ),
          '{"safeCount": 0, "riskyCount": 0, "restrictedCount": 0}'::json
        ) as summary
      FROM scans s
      LEFT JOIN scan_ingredients si ON s.id = si.scan_id
      WHERE s.user_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const scans = scansResult.rows.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      extractedText: row.extractedText,
      productCategory: row.productCategory,
      summary: row.summary
    }));

    res.json({
      data: scans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    console.error('Error fetching scan history:', e);
    next(e);
  }
};
