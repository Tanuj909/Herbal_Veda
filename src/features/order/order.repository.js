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
 * Create a new order with items and initial status history in a transaction.
 * Also decrements product stock.
 * @param {Object} orderData
 * @returns {Promise<Object>}
 */
export const createOrder = async (orderData) => {
  const { user_id, address_id, order_number, subtotal, shipping_charge, gst, total_amount, items } = orderData;

  return prisma.$transaction(async (tx) => {
    // 1. Update product quantities and verify stock
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: BigInt(item.product_id) }
      });
      
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      await tx.product.update({
        where: { id: BigInt(item.product_id) },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    // 2. Create the order with nested items and status history
    return tx.order.create({
      data: {
        order_number,
        user_id: BigInt(user_id),
        address_id: BigInt(address_id),
        subtotal: parseFloat(subtotal),
        shipping_charge: parseFloat(shipping_charge),
        gst: parseFloat(gst || 0),
        total_amount: parseFloat(total_amount),
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            product_id: BigInt(item.product_id),
            product_name: item.product_name,
            product_price: parseFloat(item.product_price),
            quantity: item.quantity,
            total_price: parseFloat(item.total_price)
          }))
        },
        status_history: {
          create: {
            status: "PENDING",
            remarks: "Order created successfully",
            created_by: BigInt(user_id)
          }
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                thumbnail_url: true,
              }
            }
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    });
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
    data.created_by = BigInt(changed_by);
  }

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
