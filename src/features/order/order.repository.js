import prisma from "@/lib/prisma";

/**
 * Maps a nested product inside an order item to convert binary thumbnail to a base64 Data URL.
 * @param {Object} prod
 * @returns {Object|null}
 */
const mapOrderProduct = (prod) => {
  if (!prod) return prod;
  const mapped = { ...prod };
  if (mapped.thumbnail) {
    const mime = mapped.thumbnail_mime || "image/jpeg";
    mapped.thumbnail_url = `data:${mime};base64,${Buffer.from(mapped.thumbnail).toString("base64")}`;
  } else {
    mapped.thumbnail_url = null;
  }
  delete mapped.thumbnail;
  delete mapped.thumbnail_mime;
  return mapped;
};

/**
 * Maps a single order to convert all nested order item products.
 * @param {Object} order
 * @returns {Object|null}
 */
const mapOrder = (order) => {
  if (!order) return order;
  const mapped = { ...order };
  if (mapped.items) {
    mapped.items = mapped.items.map((item) => {
      if (item.product) {
        return {
          ...item,
          product: mapOrderProduct(item.product),
        };
      }
      return item;
    });
  }
  return mapped;
};

/**
 * Maps multiple orders.
 * @param {Array} orders
 * @returns {Array}
 */
const mapOrders = (orders) => {
  if (!orders) return orders;
  return orders.map(mapOrder);
};

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

  const orders = await prisma.order.findMany({
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
              thumbnail: true,
              thumbnail_mime: true,
            },
          },
        },
      },
      payments: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return mapOrders(orders);
};

/**
 * Find an order by its unique ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findOrderById = async (id) => {
  const order = await prisma.order.findUnique({
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
              thumbnail: true,
              thumbnail_mime: true,
            },
          },
        },
      },
      status_history: {
        orderBy: {
          created_at: "desc",
        },
      },
      payments: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  return mapOrder(order);
};

/**
 * Update an order's status and logging parameters.
 * @param {string|number|BigInt} id
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateOrder = async (id, updateData, db = prisma) => {
  const { status, payment_status, payment_method } = updateData;
  const data = {};

  if (status !== undefined) data.status = status;
  if (payment_status !== undefined) data.payment_status = payment_status;
  if (payment_method !== undefined) data.payment_method = payment_method;

  return db.order.update({
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
  const {
    user_id,
    address_id,
    order_number,
    subtotal,
    shipping_charge,
    gst,
    total_amount,
    payment_method = "COD",
    payment_status = "PENDING",
    razorpay_order_id = null,
    items,
  } = orderData;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update product quantities and verify stock
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: BigInt(item.product_id) },
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
            decrement: item.quantity,
          },
        },
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
        payment_method,
        payment_status,
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            product_id: BigInt(item.product_id),
            product_name: item.product_name,
            product_price: parseFloat(item.product_price),
            quantity: item.quantity,
            total_price: parseFloat(item.total_price),
          })),
        },
        payments: {
          create: {
            amount: parseFloat(total_amount),
            payment_method,
            status: payment_status,
            razorpay_order_id,
          },
        },
        status_history: {
          create: {
            status: "PENDING",
            remarks: "Order created successfully",
            created_by: BigInt(user_id),
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                thumbnail: true,
                thumbnail_mime: true,
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  });

  return mapOrder(result);
};

/**
 * Add an order status change history log.
 * @param {Object} historyData
 * @returns {Promise<Object>}
 */
export const createStatusHistory = async (historyData, db = prisma) => {
  const { order_id, status, changed_by, remarks } = historyData;

  const data = {
    order_id: BigInt(order_id),
    status,
    remarks,
  };

  if (changed_by) {
    data.created_by = BigInt(changed_by);
  }

  return db.orderStatusHistory.create({
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

