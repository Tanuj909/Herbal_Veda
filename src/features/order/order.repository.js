import prisma from "@/lib/prisma";

/**
 * Find all orders with optional filters.
 * @param {Object} [filters]
 * @param {string} [filters.status] - Filter by order status
 * @param {string|number|BigInt} [filters.user_id] - Filter by customer user ID
 * @returns {Promise<Array>}
 */
export const findAllOrders = async (filters = {}) => {
  const where = {};

  if (filters.status !== undefined) {
    where.status = filters.status;
  }

  if (filters.user_id !== undefined) {
    where.user_id = BigInt(filters.user_id);
  }

  return prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      address: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              thumbnail_url: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

/**
 * Find an order by its unique ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id: BigInt(id) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      address: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              thumbnail_url: true,
            },
          },
        },
      },
      status_history: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });
};

/**
 * Update an order's status and logging parameters.
 * @param {string|number|BigInt} id
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateOrder = async (id, updateData) => {
  const { status, payment_status } = updateData;
  const data = {};

  if (status !== undefined) data.status = status;
  if (payment_status !== undefined) data.payment_status = payment_status;

  return prisma.order.update({
    where: { id: BigInt(id) },
    data,
  });
};

/**
 * Add an order status change history log.
 * @param {Object} historyData
 * @returns {Promise<Object>}
 */
export const createStatusHistory = async (historyData) => {
  const { order_id, status, changed_by, remarks } = historyData;

  const data = {
    order_id: BigInt(order_id),
    status,
    remarks,
  };

  if (changed_by) {
    data.changed_by = BigInt(changed_by);
  }

  // Note: the schema maps relation "order" to User (changed_by)
  return prisma.orderStatusHistory.create({
    data,
  });
};

/**
 * Get count of orders.
 * @returns {Promise<number>}
 */
export const countOrders = async () => {
  return prisma.order.count();
};

/**
 * Calculate total sales revenue from successful/delivered orders.
 * @returns {Promise<number>}
 */
export const sumRevenue = async () => {
  const aggregate = await prisma.order.aggregate({
    _sum: {
      total_amount: true,
    },
    where: {
      payment_status: "SUCCESS",
    },
  });
  return aggregate._sum.total_amount ? Number(aggregate._sum.total_amount) : 0;
};
