/**
 * Reusable Prisma pagination helper.
 * Source: Product/backend/helpers/paginate.js
 *
 * Usage:
 *   const { skip, take, meta } = paginate(req.query);
 *   const rows  = await prisma.model.findMany({ skip, take, where });
 *   const total = await prisma.model.count({ where });
 *   res.json(apiResponse.response('SUCCESS', { rows, pagination: meta(total) }));
 */
function paginate(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip  = (page - 1) * limit;

  return {
    skip,
    take: limit,
    meta(total) {
      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext:    page * limit < total,
        hasPrev:    page > 1,
      };
    },
  };
}

module.exports = paginate;
