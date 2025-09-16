"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrdersController = exports.SellerOrdersController = exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    getCustomerOrders(req) {
        return this.ordersService.getCustomerOrders(req.user.sub);
    }
    getOrderById(req, orderId) {
        return this.ordersService.getOrderById(req.user.sub, orderId);
    }
    createOrder(req, orderData) {
        return this.ordersService.createOrder(req.user.sub, orderData);
    }
    cancelOrder(req, orderId) {
        return this.ordersService.cancelOrder(req.user.sub, orderId);
    }
    processPayment(req, orderId, paymentData) {
        return this.ordersService.processPayment(orderId, paymentData);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getCustomerOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)(':id/process-payment'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "processPayment", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('customers/orders'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
let SellerOrdersController = class SellerOrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    getSellerOrders(req) {
        return this.ordersService.getSellerOrders(req.user.sub);
    }
    getSellerOrderById(req, orderId) {
        return this.ordersService.getSellerOrderById(req.user.sub, orderId);
    }
    updateOrderStatus(req, orderId, body) {
        return this.ordersService.updateOrderStatus(req.user.sub, orderId, body.status);
    }
};
exports.SellerOrdersController = SellerOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SellerOrdersController.prototype, "getSellerOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SellerOrdersController.prototype, "getSellerOrderById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SellerOrdersController.prototype, "updateOrderStatus", null);
exports.SellerOrdersController = SellerOrdersController = __decorate([
    (0, common_1.Controller)('sellers/orders'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SELLER),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], SellerOrdersController);
let AdminOrdersController = class AdminOrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    getAllOrders() {
        return this.ordersService.getAllOrders();
    }
    getOrderById(orderId) {
        return this.ordersService.getOrderById('admin', orderId);
    }
    updateOrderStatus(orderId, body) {
        return this.ordersService.updateOrderStatusByAdmin(orderId, body.status);
    }
    getAdminDashboardStats() {
        return this.ordersService.getAdminDashboardStats();
    }
    getAdminAnalyticsStats() {
        return this.ordersService.getAdminAnalyticsStats();
    }
};
exports.AdminOrdersController = AdminOrdersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('stats/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "getAdminDashboardStats", null);
__decorate([
    (0, common_1.Get)('stats/analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "getAdminAnalyticsStats", null);
exports.AdminOrdersController = AdminOrdersController = __decorate([
    (0, common_1.Controller)('admin/orders'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], AdminOrdersController);
//# sourceMappingURL=orders.controller.js.map