import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from '../payment/razorpay.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private razorpayService: RazorpayService
  ) {}

  private calculateEstimatedDelivery(pincode: string): Date {
    // Mock delivery calculation based on pincode
    const deliveryDays = Math.floor(Math.random() * 3) + 2; // 2-4 days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    return deliveryDate;
  }

  async createOrder(userId: string, orderData: {
    items: Array<{
      productId: string;
      sellerId: string;
      quantity: number;
      price: number;
    }>;
    deliveryAddress: any;
    paymentMethod: string;
    totalAmount: number;
  }) {
    // Verify all products exist and are approved
    const productIds = orderData.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        approvalStatus: 'APPROVED',
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products are not available');
    }

    // Check stock availability
    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product?.name}`);
      }
    }

    // Calculate estimated delivery date
    const estimatedDelivery = this.calculateEstimatedDelivery(orderData.deliveryAddress.pincode);

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount: orderData.totalAmount,
        status: 'PENDING',
        paymentMethod: orderData.paymentMethod,
        deliveryAddress: orderData.deliveryAddress,
        estimatedDelivery,
        items: {
          create: orderData.items.map(item => ({
            productId: item.productId,
            sellerId: item.sellerId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Update product stock
    for (const item of orderData.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  }

  async processPayment(orderId: string, paymentData: {
    paymentId: string;
    orderId: string;
    signature: string;
  }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in pending status');
    }

    // Verify payment (dummy implementation)
    const paymentVerification = await this.razorpayService.verifyPayment(
      paymentData.paymentId,
      paymentData.orderId,
      paymentData.signature
    );

    if (!paymentVerification.verified) {
      throw new BadRequestException('Payment verification failed');
    }

    // Update order status and payment details
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentId: paymentData.paymentId,
        paymentStatus: 'COMPLETED',
        paymentDetails: JSON.stringify(paymentVerification),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Update product stock
    for (const item of updatedOrder.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return updatedOrder;
  }

  async getSellerOrders(sellerId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        items: {
          some: {
            sellerId: sellerId,
          },
        },
      },
      include: {
        items: {
          where: {
            sellerId: sellerId,
          },
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(-8),
      customer: order.user,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      estimatedDelivery: order.estimatedDelivery,
      paymentStatus: order.paymentStatus || 'PENDING',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images ? JSON.parse(item.product.images) : [],
          price: item.product.price,
          category: item.product.category,
        },
        seller: {
          id: item.product.seller.id,
          businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
          businessAddress: item.product.seller.email,
          businessPhone: item.product.seller.phone,
          businessEmail: item.product.seller.email,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    }));
  }

  async getSellerOrderById(sellerId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            sellerId: sellerId,
          },
        },
      },
      include: {
        items: {
          where: {
            sellerId: sellerId,
          },
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.id.slice(-8),
      customer: order.user,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      estimatedDelivery: order.estimatedDelivery,
      paymentStatus: order.paymentStatus || 'PENDING',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images ? JSON.parse(item.product.images) : [],
          price: item.product.price,
          category: item.product.category,
        },
        seller: {
          id: item.product.seller.id,
          businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
          businessAddress: item.product.seller.email,
          businessPhone: item.product.seller.phone,
          businessEmail: item.product.seller.email,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  async updateOrderStatus(sellerId: string, orderId: string, status: string) {
    // Verify the order belongs to this seller
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            sellerId: sellerId,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or not accessible');
    }

    // Update the order status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        items: {
          where: {
            sellerId: sellerId,
          },
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.id.slice(-8),
      customer: updatedOrder.user,
      status: updatedOrder.status,
      totalAmount: updatedOrder.totalAmount,
      paymentMethod: updatedOrder.paymentMethod,
      deliveryAddress: updatedOrder.deliveryAddress,
      estimatedDelivery: updatedOrder.estimatedDelivery,
      paymentStatus: updatedOrder.paymentStatus || 'PENDING',
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      items: updatedOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images ? JSON.parse(item.product.images) : [],
          price: item.product.price,
          category: item.product.category,
        },
        seller: {
          id: item.product.seller.id,
          businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
          businessAddress: item.product.seller.email,
          businessPhone: item.product.seller.phone,
          businessEmail: item.product.seller.email,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  async getCustomerOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images ? JSON.parse(item.product.images) : [],
          price: item.product.price,
          category: item.product.category,
        },
        seller: {
          id: item.product.seller.id,
          businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
          businessAddress: item.product.seller.email,
          businessPhone: item.product.seller.phone,
          businessEmail: item.product.seller.email,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    }));
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images ? JSON.parse(item.product.images) : [],
          price: item.product.price,
          category: item.product.category,
        },
        seller: {
          id: item.product.seller.id,
          businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
          businessAddress: item.product.seller.email,
          businessPhone: item.product.seller.phone,
          businessEmail: item.product.seller.email,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Allow cancellation only before shipment
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException('Product has been shipped and cannot be cancelled');
    }

    // Restore product stock
    for (const item of order.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Delete the order completely instead of marking as cancelled
    // First delete order items, then delete the order
    await this.prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    return this.prisma.order.delete({
      where: { id: orderId },
    });
  }

  async getAllOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(-8),
      customer: order.user,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      estimatedDelivery: order.estimatedDelivery,
      paymentStatus: order.paymentStatus || 'PENDING',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images ? JSON.parse(item.product.images) : [],
          price: item.product.price,
          category: item.product.category,
        },
        seller: {
          id: item.product.seller.id,
          businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
          businessAddress: item.product.seller.email,
          businessPhone: item.product.seller.phone,
          businessEmail: item.product.seller.email,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    }));
  }

  async updateOrderStatusByAdmin(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.id.slice(-8),
      customer: updatedOrder.user,
      status: updatedOrder.status,
      totalAmount: updatedOrder.totalAmount,
      paymentMethod: updatedOrder.paymentMethod,
      deliveryAddress: updatedOrder.deliveryAddress,
      estimatedDelivery: updatedOrder.estimatedDelivery,
      paymentStatus: updatedOrder.paymentStatus || 'PENDING',
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      items: updatedOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images ? JSON.parse(item.product.images) : [],
          price: item.product.price,
          category: item.product.category,
        },
        seller: {
          id: item.product.seller.id,
          businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
          businessAddress: item.product.seller.email,
          businessPhone: item.product.seller.phone,
          businessEmail: item.product.seller.email,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  async getAdminDashboardStats() {
    try {
      // Get total orders count
      const totalOrders = await this.prisma.order.count();
      
      // Get pending orders count
      const pendingOrders = await this.prisma.order.count({
        where: { status: 'PENDING' }
      });

      // Get total revenue from delivered orders
      const revenueResult = await this.prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true }
      });
      const totalRevenue = revenueResult._sum.totalAmount || 0;

      // Get total customers count
      const totalCustomers = await this.prisma.user.count({
        where: { role: 'CUSTOMER' }
      });

      // Get total sellers count
      const totalSellers = await this.prisma.user.count({
        where: { role: 'SELLER' }
      });

      // Get pending sellers count
      const pendingSellers = await this.prisma.sellerRegistration.count({
        where: { status: 'PENDING' }
      });

      // Get approved sellers count
      const approvedSellers = await this.prisma.user.count({
        where: { role: 'SELLER' }
      });

      // Get total products count
      const totalProducts = await this.prisma.product.count({
        where: { approvalStatus: 'APPROVED' }
      });

      // Get pending products count
      const pendingProducts = await this.prisma.product.count({
        where: { approvalStatus: 'PENDING' }
      });

      // Get recent orders (last 5)
      const recentOrders = await this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      return {
        totalSellers,
        pendingSellers,
        approvedSellers,
        totalProducts,
        pendingProducts,
        totalCustomers,
        totalOrders,
        pendingOrders,
        totalRevenue: Number(totalRevenue),
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          customer: `${order.user.firstName} ${order.user.lastName}`,
          amount: Number(order.totalAmount),
          status: order.status,
          date: order.createdAt.toISOString().split('T')[0]
        }))
      };
    } catch (error) {
      console.error('Error getting admin dashboard stats:', error);
      throw error;
    }
  }

  async getAdminAnalyticsStats() {
    try {
      // Get total revenue from delivered orders
      const revenueResult = await this.prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true }
      });
      const totalRevenue = Number(revenueResult._sum.totalAmount || 0);

      // Get total orders count
      const totalOrders = await this.prisma.order.count();

      // Get total customers count
      const totalCustomers = await this.prisma.user.count({
        where: { role: 'CUSTOMER' }
      });

      // Get total products count
      const totalProducts = await this.prisma.product.count({
        where: { approvalStatus: 'APPROVED' }
      });

      // Calculate revenue growth (compare last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentRevenue = await this.prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: thirtyDaysAgo }
        },
        _sum: { totalAmount: true }
      });

      const previousRevenue = await this.prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: { 
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        },
        _sum: { totalAmount: true }
      });

      const recentRevenueAmount = Number(recentRevenue._sum.totalAmount || 0);
      const previousRevenueAmount = Number(previousRevenue._sum.totalAmount || 0);
      
      const revenueGrowth = previousRevenueAmount > 0 
        ? ((recentRevenueAmount - previousRevenueAmount) / previousRevenueAmount) * 100 
        : 0;

      // Calculate orders growth
      const recentOrdersCount = await this.prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      });

      const previousOrdersCount = await this.prisma.order.count({
        where: { 
          createdAt: { 
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      });

      const ordersGrowth = previousOrdersCount > 0 
        ? ((recentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 
        : 0;

      // Get top products by sales
      const topProducts = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 3
      });

      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId }
          });
          return {
            name: product?.name || 'Unknown Product',
            sales: item._sum.quantity || 0,
            revenue: Number(item._sum.price || 0)
          };
        })
      );

      // Get monthly revenue for the last 6 months
      const monthlyRevenue: Array<{ month: string; revenue: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthRevenue = await this.prisma.order.aggregate({
          where: {
            status: 'DELIVERED',
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: { totalAmount: true }
        });

        monthlyRevenue.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Number(monthRevenue._sum.totalAmount || 0)
        });
      }

      return {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        ordersGrowth: Number(ordersGrowth.toFixed(1)),
        topProducts: topProductsWithDetails,
        monthlyRevenue
      };
    } catch (error) {
      console.error('Error getting admin analytics stats:', error);
      throw error;
    }
  }

}